import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex';
import { useReservations, type ReservationCreate } from '../../stores/useReservations';
import { useComplexes } from '../../stores/useComplexes';
import { useVendors } from '../../stores/useVendors';
import { useTemplates } from '../../stores/useTemplates';   
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { useState, useEffect } from "react";
import FormBasic, { type FormField } from "../../components/FormBasic";
import { validateCotisWithMessage } from "../../utils/validations";
import { useNavigate } from "react-router-dom";
import { AutoComplete } from "primereact/autocomplete";
import { disassemble } from "es-hangul";
import { InputMask } from "primereact/inputmask";

export default function ReservationsNew() {
    const { createReservation } = useReservations()
    const { complexes, fetchComplexes } = useComplexes()
    const { vendors, fetchVendors } = useVendors()
    const { templates, fetchTemplates } = useTemplates()
    const navigate = useNavigate()
    const [formData, setFormData] = useState<ReservationCreate & { location_name: string, vendor_name: string, template_name: string }>({
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
    })

    useEffect(() => {
        fetchComplexes()
        fetchVendors()
        fetchTemplates()
    }, [fetchComplexes, fetchVendors, fetchTemplates])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(formData)
        if (!formData.location || !formData.vendor || !formData.reserved_at) {
            alert('필수 항목을 모두 입력해주세요.')
            return
        }
        
        // 서버로 보낼 데이터 정제 (불필요한 필드 제거)
        const reservationData: ReservationCreate = {
            cotis: formData.cotis,
            reserved_at: formData.reserved_at,
            is_transfered: formData.is_transfered || false,
            description: formData.description || null,
            location: formData.location,
            vendor: formData.vendor,
            template: formData.template && formData.template > 0 ? formData.template : null,
        }
        
        createReservation(reservationData)  
        .then(() => {
            alert('접수 등록이 완료되었습니다.')
            navigate('/reservations/list')
        })
        .catch((error) => {
            console.log(error)
            alert(error.response.data.detail)
        })
    }

    const fields: FormField[] = [
        {
            label: 'COTIS',
            id: 'cotis',
            input: (
                <InputMask
                    id="cotis" 
                    value={formData.cotis} 
                    onChange={(e) => setFormData({ ...formData, cotis: e.target.value || '' })} 
                    placeholder="COTIS를 입력하세요 (예: 000000-00-00000)" 
                    className="w-full" 
                    mask="999999-99-99999"
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
                    onChange={(e) => setFormData({ ...formData, location_name: e.value, location: complexes.find(c => c.name === e.value)?.id || 0 })} 
                    suggestions={complexes.map(c => c.name).filter(c => disassemble(c).includes(disassemble(formData.location_name)))}
                    completeMethod={(e) => {
                        return complexes.filter(c => disassemble(c.name).includes(disassemble(e.query))).map(c => c.name)
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
            label: '템플릿',
            id: 'template',
            input: (
                <AutoComplete 
                    id="template"
                    value={formData.template_name} 
                    onChange={(e) => setFormData({ ...formData, template_name: e.value, template: templates.find(t => t.name === e.value)?.id || 0 })} 
                    suggestions={templates.map(t => t.name).filter(t => disassemble(t).includes(disassemble(formData.template_name)))}
                    completeMethod={(e) => {
                        return templates.filter(t => disassemble(t.name).includes(disassemble(e.query))).map(t => t.name)
                    }}
                    placeholder="템플릿을 선택하세요 (선택사항)"
                    className="w-full" 
                    inputStyle={{ width: '100%', maxWidth: 'none' }}
                    style={{ width: '100%', maxWidth: 'none' }}
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
                    locale="ko"
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    required
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
    ]

    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
            <div {...stylex.props(styles.content)}>
                <h1>접수 등록</h1>
                <p>접수 등록 페이지입니다.</p>
                <FormBasic 
                    fields={fields}
                    onSubmit={handleSubmit}
                    submitButton={{
                        label: '등록',
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

