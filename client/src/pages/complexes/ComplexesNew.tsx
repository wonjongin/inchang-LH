import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex';
import { useComplexes, type ComplexCreate } from '../../stores/useComplexes';
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import FormBasic, { type FormField } from "../../components/FormBasic";
import { validatePhoneNumberWithMessage, validateEmailWithMessage } from "../../utils/validations";
import { useNavigate } from "react-router-dom";

export default function ComplexesNew() {
    const { createComplex } = useComplexes()
    const navigate = useNavigate()
    const [formData, setFormData] = useState<ComplexCreate>({
        name: '',
        address: '',
        tel: '',
        email: '',
        fax: '',
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(formData)
        createComplex(formData)  
        .then(() => {
            alert('단지 등록이 완료되었습니다.')
            navigate('/complexes/list')
        })
        .catch((error) => {
            alert(error.message)
        })
    }

    const fields: FormField[] = [
        {
            label: '단지 이름',
            id: 'name',
            input: (
                <InputText 
                    id="complex_name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="단지 이름을 입력하세요" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }} 
                    required 
                />
            ),
        },
        {
            label: '주소',
            id: 'address',
            input: (
                <InputText 
                    id="address" 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                    placeholder="주소를 입력하세요" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }} 
                    required 
                />
            ),
        },
        {
            label: '전화번호',
            id: 'tel',
            input: (
                <InputText 
                    id="tel" 
                    value={formData.tel} 
                    onChange={(e) => setFormData({ ...formData, tel: e.target.value })} 
                    placeholder="전화번호를 입력하세요 (예: 02-123-4567)" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }} 
                    invalid={!!validatePhoneNumberWithMessage(formData.tel || '')}
                    required 
                />
            ),
        },
        {
            label: '팩스',
            id: 'fax',
            input: (
                <InputText 
                    id="fax" 
                    value={formData.fax} 
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
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="이메일을 입력하세요 (예: example@domain.com)" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    invalid={!!validateEmailWithMessage(formData.email || '')}
                />
            ),
        },
    ]

    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
            <div {...stylex.props(styles.content)}>
                <h1>단지 등록</h1>
                <p>단지 등록 페이지입니다.</p>
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