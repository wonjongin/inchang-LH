import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex'
import { DataTable } from 'primereact/datatable'
import { useVendors } from '../../stores/useVendors'
import { useEffect } from "react";
import { Column } from "primereact/column";
import Loading from "../../components/Loading";

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

export default function VendorsList() {
    const { vendors, loading, error, fetchVendors, deleteVendor } = useVendors()
    useEffect(() => {
        fetchVendors()
    }, [])
    if (error) {
        return <div>Error: {error}</div>
    }
    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
                <div {...stylex.props(styles.content)}>
                <h1>업체 목록</h1>
                {loading ? <Loading /> : (
                <DataTable value={vendors.map((vendor) => ({
                    ...vendor,
                    edit: <a href={`/vendors/edit/${vendor.id}`}>📝</a>,
                    delete: <a href={`/vendors/delete/${vendor.id}`} onClick={(e) => {
                        e.preventDefault()
                        if (confirm('정말 삭제하시겠습니까?')) {
                            deleteVendor(vendor.id)
                                .then(() => {
                                    alert('업체 삭제가 완료되었습니다.')
                                    fetchVendors()
                                })
                                .catch((error) => {
                                    alert(error.message)
                                })
                        }
                    }}>🗑️</a>,
                }))} size="small" stripedRows showGridlines>
                    <Column field="name" header="업체 이름" />
                    <Column field="tel" header="전화번호" />
                    <Column field="fax" header="팩스" />
                    <Column field="email" header="이메일" />
                    <Column field="control_range" header="관할범위" />
                    <Column field="template" header="템플릿 ID" />
                    <Column field="edit" header="수정" align="center" />
                    <Column field="delete" header="삭제" align="center" />
                </DataTable> )}
            </div>
        </div>
    )
}

