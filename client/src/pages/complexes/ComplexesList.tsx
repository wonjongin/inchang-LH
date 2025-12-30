import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex'
import { DataTable } from 'primereact/datatable'
import { useComplexes } from '../../stores/useComplexes'
import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import Loading from "../../components/Loading";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { useUsers } from "../../stores/useUsers";
import { Paginator } from "primereact/paginator";

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
    const { complexes, loading, error, fetchComplexes, searchComplexes, deleteComplex } = useComplexes()
    const { me, fetchMe } = useUsers()
    const [search, setSearch] = useState('')
    const [first, setFirst] = useState(0)

    const navigate = useNavigate()
    useEffect(() => {
        fetchComplexes();
        fetchMe()
    }, [])

    useEffect(() => {
        fetchComplexes(first, 100)
    }, [first])
    if (error) {
        return <div>Error: {error}</div>
    }

    const handleSearch = () => {
        if (search.length > 0) {
            searchComplexes(search)
        } else {
            fetchComplexes()
        }
    }
    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
            <div {...stylex.props(styles.content)}>
            <h1>단지 목록</h1>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                <div className="p-inputgroup" style={{ width: '300px' }}>
                    <InputText placeholder="검색" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch()
                        }
                    }} />
                    <Button icon="pi pi-search" onClick={handleSearch} />
                </div>
                <Button icon="pi pi-plus" label="단지 등록" onClick={() => navigate('/complexes/new')} />
            </div>
            <br />
            {loading ? <Loading /> : (
            <>
            <Paginator first={first} rows={complexes.limit} totalRecords={complexes.total} onPageChange={(e) => {
                setFirst(e.first)
            }} />
            <DataTable value={complexes.items.map((complex) => ({
                ...complex,
                edit: <a href={`/complexes/edit/${complex.id}`}>📝</a>,
                delete:<a href={`/complexes/delete/${complex.id}`} onClick={(e) => {
                    e.preventDefault()
                    if (confirm('정말 삭제하시겠습니까?')) {
                        deleteComplex(complex.id)
                            .then(() => {
                                alert('단지 삭제가 완료되었습니다.')
                                fetchComplexes()
                            })
                            .catch((error) => {
                                alert(error.message)
                            })
                    }
                }}>🗑️</a> ,
            }))} size="small" stripedRows showGridlines>
                <Column field="name" header="단지 이름" />
                <Column field="address" header="주소" />
                <Column field="tel" header="전화번호" />
                <Column field="fax" header="팩스" />
                <Column field="email" header="이메일" />
                <Column field="edit" header="수정" align="center" />
                {me?.permission === 1 && (
                    <Column field="delete" header="삭제" align="center" /> )}
            </DataTable> 
            
            </>)}
            </div>
        </div>
    )
}



 