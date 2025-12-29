import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex';
import { useTemplates, type TemplateCreate } from '../../stores/useTemplates';
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import { useState } from "react";
import FormBasic, { type FormField } from "../../components/FormBasic";
import { useNavigate } from "react-router-dom";
import { InputTextarea } from "primereact/inputtextarea";

export default function TemplatesNew() {
    const { createTemplate } = useTemplates()
    const navigate = useNavigate()
    const [formData, setFormData] = useState<TemplateCreate>({
        name: '',
        fmt: '',
        file: null,
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(formData)
        if (!formData.name) {
            alert('양식 이름을 입력해주세요.')
            return
        }
        
        const templateData: TemplateCreate = {
            ...formData,
            file: selectedFile,
        }
        
        createTemplate(templateData)  
        .then(() => {
            alert('양식 등록이 완료되었습니다.')
            navigate('/templates/list')
        })
        .catch((error) => {
            console.log(error)
            alert(error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.')
        })
    }

    const fields: FormField[] = [
        {
            label: '양식 이름',
            id: 'name',
            input: (
                <InputText 
                    id="template_name"
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="양식 이름을 입력하세요" 
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }} 
                    required 
                />
            ),
        },
        {
            label: '파일',
            id: 'file',
            input: (
                <FileUpload 
                    mode="basic"
                    accept=".xlsx,.xls"
                    maxFileSize={10000000}
                    onSelect={(e) => {
                        const file = e.files[0]
                        setSelectedFile(file)
                    }}
                    auto
                    chooseLabel={selectedFile ? selectedFile.name : "파일 선택"}
                    className="w-full"
                />
            ),
        },
        {
            label: '양식',
            id: 'fmt',
            input: (
                <InputTextarea
                    id="template_fmt"
                    value={formData.fmt}
                    onChange={(e) => setFormData({ ...formData, fmt: e.target.value })}
                    placeholder="양식을 입력하세요 (예: A1 {{cotis}} B1 {{연도}} C1 {{월}} D1 {{일}} E1 {{주소}} F1 {{연락처}} G1 {{내용}} H1 {{단지명}} I1 {{업체명}})"
                    className="w-full"
                    style={{ width: '100%', maxWidth: 'none', minHeight: '200px' }}
                    required
                />
            ),
        },
    ]

    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
            <div {...stylex.props(styles.content)}>
                <h1>양식 등록</h1>
                <p>양식 등록 페이지입니다.</p>
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
                <p>
                양식 예시: <br />
                <span dangerouslySetInnerHTML={{ __html: `A1<br />{{cotis}}<br />B1<br />{{연도}}<br />C1<br />{{월}}<br />D1<br />{{일}}<br />E1<br />{{주소}}<br />F1<br />{{연락처}}<br />G1<br />{{내용}}<br />H1<br />{{단지명}}<br />I1<br />{{업체명}}` }} />
                </p>
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

