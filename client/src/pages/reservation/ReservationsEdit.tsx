import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex';
import { useReservations, type ReservationCreate } from '../../stores/useReservations';
import { useComplexes } from '../../stores/useComplexes';
import { useVendors } from '../../stores/useVendors';
import { useTemplates } from '../../stores/useTemplates';   
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { useState, useEffect } from "react";
import FormBasic, { type FormField } from "../../components/FormBasic";
import { validateCotisWithMessage } from "../../utils/validations";
import { useNavigate, useParams } from "react-router-dom";
import { AutoComplete } from "primereact/autocomplete";
import { disassemble } from "es-hangul";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";

export default function ReservationsEdit() {
    const { reservationId } = useParams()
    const { selectedReservation, fetchReservation, updateReservation } = useReservations()
    const { all_complex_names, fetchAllComplexNames } = useComplexes()
    const { vendors, fetchVendors } = useVendors()
    const { templates, fetchTemplates } = useTemplates()
    const navigate = useNavigate()
    const [formData, setFormData] = useState<ReservationCreate & { location_name: string, vendor_name: string, template_name: string, completed_at: string | null }>({
        cotis: '',
        reserved_at: '',
        is_transfered: false,
        description: null,
        location: 0,
        location_name: '',
        vendor: 0,
        vendor_name: '',
        template: null,
        template_name: '',
        completed_at: null,
    })
    const [reservationPhoto, setReservationPhoto] = useState<File | null>(null)
    useEffect(() => {
        if (reservationId) {
            fetchReservation(Number(reservationId))
        }
        fetchAllComplexNames()
        fetchVendors()
        fetchTemplates()
    }, [reservationId, fetchReservation, fetchAllComplexNames, fetchVendors, fetchTemplates])

    useEffect(() => {
        if (selectedReservation) {
            setFormData({
                cotis: selectedReservation.cotis,
                reserved_at: selectedReservation.reserved_at,
                is_transfered: selectedReservation.is_transfered || false,
                description: selectedReservation.description || null,
                location: selectedReservation.location.id,
                location_name: selectedReservation.location.name,
                vendor: selectedReservation.vendor.id,
                vendor_name: selectedReservation.vendor.name,
                template: selectedReservation.template?.id || 0,
                template_name: selectedReservation.template?.name || '',
                completed_at: selectedReservation.completed_at || null,
            })
        }
    }, [selectedReservation, templates])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(formData)
        if (!formData.location || !formData.vendor || !formData.reserved_at) {
            alert('필수 항목을 모두 입력해주세요.')
            return
        }
        
        // 서버로 보낼 데이터 정제 (불필요한 필드 제거)
        const reservationData: Partial<ReservationCreate> & { completed_at?: string | null } = {
            cotis: formData.cotis,
            reserved_at: formData.reserved_at,
            is_transfered: formData.is_transfered || false,
            description: formData.description || null,
            location: formData.location,
            vendor: formData.vendor,
            template: formData.template && formData.template > 0 ? formData.template : null,
            completed_at: formData.completed_at || null,
        }
        
        updateReservation(Number(reservationId), reservationData, reservationPhoto)  
        .then(() => {
            alert('접수 수정이 완료되었습니다.')
            navigate('/reservations/list')
        })
        .catch((error) => {
            console.log(error)
            alert(error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.')
        })
    }

    const fields: FormField[] = [
        {
            label: 'COTIS',
            id: 'cotis',
            input: (
                <InputText 
                    id="cotis" 
                    value={formData.cotis} 
                    onChange={(e) => setFormData({ ...formData, cotis: e.target.value })} 
                    placeholder="COTIS를 입력하세요 (예: 000000-00-00000)" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }} 
                    invalid={!!validateCotisWithMessage(formData.cotis || '')}
                    required 
                />
            ),
        },
        {
            label: '단지',
            id: 'location',
            input: (
                <AutoComplete 
                    id="location"
                    value={formData.location_name} 
                    onChange={(e) => setFormData({ ...formData, location_name: e.value, location: all_complex_names.find(c => c.name === e.value)?.id || 0 })} 
                    suggestions={all_complex_names.map(c => c.name).filter(c => disassemble(c).includes(disassemble(formData.location_name)))}
                    completeMethod={(e) => {
                        return all_complex_names.filter(c => disassemble(c.name).includes(disassemble(e.query))).map(c => c.name)
                    }}
                    placeholder="단지를 선택하세요"
                    className="w-full" 
                    inputStyle={{ width: '100%', maxWidth: 'none' }}
                    style={{ width: '100%', maxWidth: 'none' }}
                    required
                />
            ),
        },
        {
            label: '업체',
            id: 'vendor',
            input: (
                <AutoComplete 
                    id="vendor"
                    value={formData.vendor_name} 
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.value, vendor: vendors.find(v => v.name === e.value)?.id || 0 })} 
                    suggestions={vendors.map(v => v.name).filter(v => disassemble(v).includes(disassemble(formData.vendor_name)))}
                    completeMethod={(e) => {
                        return vendors.filter(v => disassemble(v.name).includes(disassemble(e.query))).map(v => v.name)
                    }}
                    placeholder="업체를 선택하세요"
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    inputStyle={{ width: '100%', maxWidth: 'none' }}
                    required
                />
            ),
        },
        {
            label: '양식',
            id: 'template',
            input: (
                <Dropdown 
                    id="template"
                    value={formData.template || null} 
                    onChange={(e: any) => setFormData({ ...formData, template: e.value })} 
                    options={templates.map(t => ({ label: t.name, value: t.id }))}
                    placeholder="양식을 선택하세요 (선택사항)"
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    showClear
                />
            ),
        },
        {
            label: '접수일',
            id: 'reserved_at',
            input: (
                <Calendar 
                    id="reserved_at"
                    value={formData.reserved_at ? new Date(formData.reserved_at) : null}
                    onChange={(e) => setFormData({ ...formData, reserved_at: e.value ? e.value.toISOString().split('T')[0] : '' })} 
                    dateFormat="yy-mm-dd"
                    placeholder="접수일을 선택하세요"
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    required
                    showIcon
                />
            ),
        },
        {
            label: '완료일',
            id: 'completed_at',
            input: (
                <Calendar 
                    id="completed_at"
                    value={formData.completed_at ? new Date(formData.completed_at) : null}
                    onChange={(e) => setFormData({ ...formData, completed_at: e.value ? e.value.toISOString().split('T')[0] : null })} 
                    dateFormat="yy-mm-dd"
                    placeholder="완료일을 선택하세요 (선택사항)"
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    showIcon
                />
            ),
        },
        {
            label: '이관여부',
            id: 'is_transfered',
            input: (
                <Checkbox 
                    id="is_transfered"
                    checked={formData.is_transfered || false}
                    onChange={(e) => setFormData({ ...formData, is_transfered: e.checked || false })} 
                />
            ),
        },
        {
            label: '설명',
            id: 'description',
            input: (
                <InputTextarea 
                    id="description" 
                    value={formData.description || ''} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value || null })} 
                    placeholder="설명을 입력하세요" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    rows={3}
                />
            ),
        },
        {
            label: '접수 문서',
            id: 'reservation_photo',
            input: (
                <FileUpload
                    mode="basic"
                    accept=".pdf"
                    maxFileSize={20000000}
                    auto
                    onSelect={(e) => {
                        const file = e.files[0]
                        setReservationPhoto(file)
                    }}
                    chooseLabel={reservationPhoto ? reservationPhoto.name : "접수 문서 선택"}
                    className="w-full"
                />
            ),
        },
    ]

    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
            <div {...stylex.props(styles.content)}>
                <h1>접수 수정</h1>
                <p>접수 수정 페이지입니다.</p>
                <FormBasic 
                    fields={fields}
                    onSubmit={handleSubmit}
                    submitButton={{
                        label: '수정',
                        icon: 'pi pi-check',
                        loading: false,
                        disabled: false,
                    }}
                />
            </div>
        </div>
    )
}

const styles = stylex.create({
    page: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: 1,
        padding: '2rem',
    },
})
