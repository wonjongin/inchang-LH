import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex'
import { DataTable } from 'primereact/datatable'
import { useComplexes } from '../../stores/useComplexes'
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

export default function ComplexesList() {
    const { complexes, loading, error, fetchComplexes } = useComplexes()
    const navigate = useNavigate()
    useEffect(() => {
        fetchComplexes()
    }, [])
    if (error) {
        return <div>Error: {error}</div>
    }
    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
            <div {...stylex.props(styles.content)}>
            <h1>단지 목록</h1>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                <Button icon="pi pi-plus" label="단지 등록" onClick={() => navigate('/complexes/new')} />
            </div>
            <br />
            {loading ? <Loading /> : (
            <DataTable value={complexes.map((complex) => ({
                ...complex,
                edit: <a href={`/complexes/edit/${complex.id}`}>📝</a>,
                delete: <a href={`/complexes/delete/${complex.id}`}>🗑️</a>,
            }))} size="small" stripedRows showGridlines>
                <Column field="name" header="단지 이름" />
                <Column field="address" header="주소" />
                <Column field="tel" header="전화번호" />
                <Column field="fax" header="팩스" />
                <Column field="email" header="이메일" />
                <Column field="edit" header="수정" align="center" />
                <Column field="delete" header="삭제" align="center" />
            </DataTable> )}
            </div>
        </div>
    )
}



 