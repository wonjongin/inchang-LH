import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex'
import { DataTable } from 'primereact/datatable'
import { useTemplates } from '../../stores/useTemplates'
import { useEffect } from "react";
import { Column } from "primereact/column";
import Loading from "../../components/Loading";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

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

export default function TemplatesList() {
    const { templates, loading, error, fetchTemplates, deleteTemplate } = useTemplates()
    const navigate = useNavigate()
    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates])
    if (error) {
        return <div>Error: {error}</div>
    }
    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
            <div {...stylex.props(styles.content)}>
            <h1>양식 목록</h1>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                <Button icon="pi pi-plus" label="양식 등록" onClick={() => navigate('/templates/new')} />
            </div>
            <br />
            {loading ? <Loading /> : (
            <DataTable value={templates.map((template) => ({
                ...template,
                edit: <a href={`/templates/edit/${template.id}`}>📝</a>,
                delete: <a href={`/templates/delete/${template.id}`} onClick={(e) => {
                    e.preventDefault()
                    if (confirm('정말 삭제하시겠습니까?')) {
                        deleteTemplate(template.id)
                            .then(() => {
                                alert('양식 삭제가 완료되었습니다.')
                                fetchTemplates()
                            })
                            .catch((error) => {
                                alert(error.message)
                            })
                    }
                }}>🗑️</a>,
            }))} size="small" stripedRows showGridlines>
                <Column field="name" header="양식 이름" />
                <Column field="fmt" header="형식" />
                <Column field="edit" header="수정" align="center" />
                <Column field="delete" header="삭제" align="center" />
            </DataTable> )}
            </div>
        </div>
    )
}

