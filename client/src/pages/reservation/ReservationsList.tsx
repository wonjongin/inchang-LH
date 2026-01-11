import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex'
import { DataTable } from 'primereact/datatable'
import { useReservations } from '../../stores/useReservations'
import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import Loading from "../../components/Loading";
import { SelectButton } from "primereact/selectbutton";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../stores/useUsers";

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
    const { reservations, loading, error, fetchReservationsByMonth, deleteReservation } = useReservations()
    const { me, fetchMe } = useUsers()
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [year, setYear] = useState(new Date().getFullYear())
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const selectedStatusOptions = [
        { label: '전체', value: 'all' },
        { label: '진행중', value: 'progressing' },
        { label: '완료', value: 'completed' },
    ]
    const navigate = useNavigate()

    useEffect(() => {
        fetchMe()
    }, [])
    useEffect(() => {
        fetchReservationsByMonth(year, month, selectedStatus)
    }, [selectedStatus, year, month])


    if (error) {
        return <div>Error: {error}</div>
    }
    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
                <div {...stylex.props(styles.content)}>
                <h1>접수 목록</h1>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="p-inputgroup" style={{ width: '300px' }}>
                        <Button icon="pi pi-chevron-left" onClick={() => {
                            if (month > 1) {
                                setMonth(month - 1)
                            } else {
                                setYear(year - 1)
                                setMonth(12)
                            }
                        }} />
                        <InputText type="number" value={year.toString()} onChange={(e) => setYear(Number(e.target.value))} style={{ textAlign: 'right' }} />
                        <span className="p-inputgroup-addon">년</span>
                        <InputText type="number" value={`${month}`} onChange={(e) => setMonth(Number(e.target.value))} style={{ textAlign: 'right' }} />
                        <span className="p-inputgroup-addon">월</span>
                        <Button icon="pi pi-chevron-right" onClick={() => {
                            if (month < 12) {
                                setMonth(month + 1)
                            } else {
                                setYear(year + 1)
                                setMonth(1)
                            }
                        }} />
                    </div>
                    <SelectButton
                        value={selectedStatus} 
                        onChange={(e) => setSelectedStatus(e.value)} 
                        options={selectedStatusOptions} 
                        style={{ width: '170px' }}
                    />
                    <Button icon="pi pi-plus" label="접수 등록" onClick={() => navigate('/reservations/new')} />
                </div>
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
                                    fetchReservationsByMonth(year, month, selectedStatus)
                                })
                                .catch((error) => {
                                    alert(error.message)
                                })
                        }
                    }}>🗑️</a>,
                    complete: reservation.completed_at ? 
                        <a href={`${import.meta.env.VITE_API_URL}/api/v1/reservations/${reservation.id}/generate-certificate`}>🟩</a> : 
                        <a href={`/reservations/complete/${reservation.id}`}>🟥</a>,
                }))} size="small" stripedRows showGridlines>
                    <Column field="cotis" header="COTIS" />
                    <Column field="locationName" header="단지" />
                    <Column field="vendorName" header="업체" />
                    {/* <Column field="authorName" header="작성자" /> */}
                    <Column field="reserved_at" header="접수일" />
                    <Column field="completed_at" header="완료일" />
                    <Column field="is_transfered" header="이관" body={(rowData) => rowData.is_transfered ? 'Y' : 'N'} />
                    <Column field="reservation_photo" header="접사" align="center" body={(rowData) => <a href={`${import.meta.env.VITE_API_URL}/api/v1/reservations/${rowData.id}/reservation-photo`} download={true}>📷</a>} />
                    <Column field="generate_certificate_template" header="양식" align="center" body={(rowData) => <a href={`${import.meta.env.VITE_API_URL}/api/v1/reservations/${rowData.id}/generate-certificate-template`} download={true}>🖨️</a>} />
                    <Column field="complete" header="완료" align="center" />
                    <Column field="edit" header="수정" align="center" />
                    {me?.permission === 1 && (
                        <Column field="delete" header="삭제" align="center" />
                    )}
                </DataTable> )}
            </div>
        </div>
    )
}

