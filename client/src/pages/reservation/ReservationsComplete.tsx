import Navbar from "../../components/Navbar";
import * as stylex from '@stylexjs/stylex';
import { useReservations } from '../../stores/useReservations';
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";
import { useState, useEffect } from "react";
import FormBasic, { type FormField } from "../../components/FormBasic";
import { useNavigate, useParams } from "react-router-dom";

export default function ReservationsComplete() {
    const { reservationId } = useParams()
    const { selectedReservation, fetchReservation } = useReservations()
    const navigate = useNavigate()
    const [completedAt, setCompletedAt] = useState<Date | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    useEffect(() => {
        if (reservationId) {
            fetchReservation(Number(reservationId))
        }
    }, [reservationId, fetchReservation])

    useEffect(() => {
        if (selectedReservation?.completed_at) {
            setCompletedAt(new Date(selectedReservation.completed_at))
        }
    }, [selectedReservation])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (!completedAt && !selectedFile) {
            alert('완료일 또는 완료확인서 파일을 입력해주세요.')
            return
        }
        
        // FormData 생성
        const formData = new FormData()
        if (completedAt) {
            formData.append('completed_at', completedAt.toISOString().split('T')[0])
        }
        if (selectedFile) {
            formData.append('certificate', selectedFile)
        }

        const accessToken = localStorage.getItem('accessToken')?.trim()
        if (!accessToken) {
            alert('인증 토큰이 없습니다. 다시 로그인해주세요.')
            return
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/v1/reservations/${reservationId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        })
        .then(async (response) => {
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.detail || data.message || '접수 완료 처리에 실패했습니다.')
            }
            if (data.success) {
                alert('접수 완료 처리가 완료되었습니다.')
                navigate('/reservations/list')
            } else {
                throw new Error(data.message || '접수 완료 처리에 실패했습니다.')
            }
        })
        .catch((error) => {
            console.log(error)
            alert(error.message || '서버에 연결할 수 없습니다.')
        })
    }

    const fields: FormField[] = [
        {
            label: '완료일',
            id: 'completed_at',
            input: (
                <Calendar 
                    id="completed_at"
                    value={completedAt}
                    onChange={(e) => setCompletedAt(e.value as Date | null)} 
                    dateFormat="yy-mm-dd"
                    placeholder="완료일을 선택하세요"
                    className="w-full" 
                    style={{ width: '100%', maxWidth: 'none' }}
                    showIcon
                />
            ),
        },
        {
            label: '완료확인서',
            id: 'certificate',
            input: (
                <FileUpload 
                    mode="basic"
                    accept=".pdf"
                    maxFileSize={20000000}
                    onSelect={(e) => {
                        const file = e.files[0]
                        setSelectedFile(file)
                    }}
                    auto
                    chooseLabel={selectedFile ? selectedFile.name : "PDF 파일 선택"}
                    className="w-full"
                />
            ),
        },
    ]

    return (
        <div {...stylex.props(styles.page)}>
            <Navbar />
            <div {...stylex.props(styles.content)}>
                <h1>접수 완료 처리</h1>
                <p>접수 완료 처리를 진행합니다.</p>
                {selectedReservation && (
                    <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <p><strong>COTIS:</strong> {selectedReservation.cotis}</p>
                        <p><strong>단지:</strong> {selectedReservation.location.name}</p>
                        <p><strong>업체:</strong> {selectedReservation.vendor.name}</p>
                        <p><strong>접수일:</strong> {selectedReservation.reserved_at}</p>
                    </div>
                )}
                <FormBasic 
                    fields={fields}
                    onSubmit={handleSubmit}
                    submitButton={{
                        label: '완료 처리',
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

