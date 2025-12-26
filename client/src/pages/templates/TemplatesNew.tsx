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
            alert('템플릿 이름을 입력해주세요.')
            return
        }
        
        const templateData: TemplateCreate = {
            ...formData,
            file: selectedFile,
        }
        
        createTemplate(templateData)  
        .then(() => {
            alert('템플릿 등록이 완료되었습니다.')
            navigate('/templates/list')
        })
        .catch((error) => {
            console.log(error)
            alert(error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.')
        })
    }

    const fields: FormField[] = [
        {
            label: '템플릿 이름',
            id: 'name',
            input: (
                <InputText 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="템플릿 이름을 입력하세요" 
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
                    id="fmt"
                    value={formData.fmt}
                    onChange={(e) => setFormData({ ...formData, fmt: e.target.value })}
                    placeholder="양식을 입력하세요 (예: A1\n{{cotis}}\nB1\n{{연도}}\nC1\n{{월}}\nD1\n{{일}}\nE1\n{{주소}}\nF1\n{{연락처}}\nG1\n{{내용}}\nH1\n{{단지명}}\nI1\n{{업체명}})"
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
                <h1>템플릿 등록</h1>
                <p>템플릿 등록 페이지입니다.</p>
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

