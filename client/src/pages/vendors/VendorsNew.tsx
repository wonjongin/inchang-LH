import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex';
import { useVendors, type VendorCreate } from '../../stores/useVendors';
import { useTemplates } from '../../stores/useTemplates';
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useState, useEffect } from "react";
import FormBasic, { type FormField } from "../../components/FormBasic";
import { validatePhoneNumberWithMessage, validateEmailWithMessage } from "../../utils/validations";
import { useNavigate } from "react-router-dom";

export default function VendorsNew() {
    const { createVendor } = useVendors()
    const { templates, fetchTemplates } = useTemplates()
    const navigate = useNavigate()
    const [formData, setFormData] = useState<VendorCreate>({
        name: '',
        tel: '',
        fax: '',
        email: '',
        control_range: '',
        template: null as any,
    })

    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(formData)
        createVendor(formData)  
        .then(() => {
            alert('업체 등록이 완료되었습니다.')
            navigate('/vendors/list')
        })
        .catch((error) => {
            alert(error.message)
        })
    }

    const fields: FormField[] = [
        {
            label: '업체 이름',
            id: 'name',
            input: (
                <InputText 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="업체 이름을 입력하세요" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }} 
                    required 
                />
            ),
        },
        {
            label: '템플릿',
            id: 'template',
            input: (
                <Dropdown 
                    id="template"
                    value={formData.template || null} 
                    onChange={(e) => setFormData({ ...formData, template: e.value })} 
                    options={templates.map(t => ({ label: t.name, value: t.id }))}
                    placeholder="템플릿을 선택하세요 (선택사항)"
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    showClear
                />
            ),
        },
        {
            label: '전화번호',
            id: 'tel',
            input: (
                <InputText 
                    id="tel" 
                    value={formData.tel || ''} 
                    onChange={(e) => setFormData({ ...formData, tel: e.target.value })} 
                    placeholder="전화번호를 입력하세요 (예: 02-123-4567)" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }} 
                    invalid={!!validatePhoneNumberWithMessage(formData.tel || '')}
                />
            ),
        },
        {
            label: '팩스',
            id: 'fax',
            input: (
                <InputText 
                    id="fax" 
                    value={formData.fax || ''} 
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })} 
                    placeholder="팩스를 입력하세요 (예: 02-123-4567)" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }} 
                    invalid={!!validatePhoneNumberWithMessage(formData.fax || '')}
                />
            ),
        },
        {
            label: '이메일',
            id: 'email',
            input: (
                <InputText 
                    id="email" 
                    value={formData.email || ''} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="이메일을 입력하세요 (예: example@domain.com)" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    invalid={!!validateEmailWithMessage(formData.email || '')}
                />
            ),
        },
        {
            label: '관할범위',
            id: 'control_range',
            input: (
                <InputText 
                    id="control_range" 
                    value={formData.control_range || ''} 
                    onChange={(e) => setFormData({ ...formData, control_range: e.target.value })} 
                    placeholder="관할범위를 입력하세요" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                />
            ),
        },
    ]

    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
            <div {...stylex.props(styles.content)}>
                <h1>업체 등록</h1>
                <p>업체 등록 페이지입니다.</p>
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

