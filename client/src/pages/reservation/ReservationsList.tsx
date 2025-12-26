import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex'
import { DataTable } from 'primereact/datatable'
import { useReservations } from '../../stores/useReservations'
import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import Loading from "../../components/Loading";
import { SelectButton } from "primereact/selectbutton";

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

export default function ReservationsList() {
    const { reservations, loading, error, fetchReservations, deleteReservation } = useReservations()
    const [selectedStatus, setSelectedStatus] = useState('all')
    const selectedStatusOptions = [
        { label: '전체', value: 'all' },
        { label: '진행중', value: 'progressing' },
        { label: '완료', value: 'completed' },
    ]
    useEffect(() => {
        fetchReservations(0, 100, {}, selectedStatus)
    }, [selectedStatus])


    if (error) {
        return <div>Error: {error}</div>
    }
    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
                <div {...stylex.props(styles.content)}>
                <h1>접수 목록</h1>
                <SelectButton 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.value)} 
                    options={selectedStatusOptions} 
                    className="mb-2"
                />
                <br />
                {loading ? <Loading /> : (
                <DataTable value={reservations.map((reservation) => ({
                    ...reservation,
                    locationName: reservation.location.name,
                    vendorName: reservation.vendor.name,
                    authorName: reservation.author.name,
                    edit: <a href={`/reservations/edit/${reservation.id}`}>📝</a>,
                    delete: <a href={`/reservations/delete/${reservation.id}`} onClick={(e) => {
                        e.preventDefault()
                        if (confirm('정말 삭제하시겠습니까?')) {
                            deleteReservation(reservation.id)
                                .then(() => {
                                    alert('접수 삭제가 완료되었습니다.')
                                    fetchReservations()
                                })
                                .catch((error) => {
                                    alert(error.message)
                                })
                        }
                    }}>🗑️</a>,
                }))} size="small" stripedRows showGridlines>
                    <Column field="cotis" header="COTIS" />
                    <Column field="locationName" header="단지" />
                    <Column field="vendorName" header="업체" />
                    <Column field="authorName" header="작성자" />
                    <Column field="reserved_at" header="접수일" />
                    <Column field="completed_at" header="완료일" />
                    <Column field="is_transfered" header="이관" body={(rowData) => rowData.is_transfered ? 'Y' : 'N'} />
                    <Column field="edit" header="수정" align="center" />
                    <Column field="delete" header="삭제" align="center" />
                </DataTable> )}
            </div>
        </div>
    )
}

