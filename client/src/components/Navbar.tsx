import { Menubar } from 'primereact/menubar'
import type { MenuItem } from 'primereact/menuitem'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('accessTokenExpiredAt')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('refreshTokenExpiredAt')
    navigate('/login')
  }

  const items: MenuItem[] = [
    {
      label: '접수',
      icon: 'pi pi-calendar',
      items: [
        {
          label: '접수 목록',
          icon: 'pi pi-list',
          command: () => {
            navigate('/reservations/list')
          },
        },
        {
          label: '접수 등록',
          icon: 'pi pi-calendar',
          command: () => {
            navigate('/reservations/new')
          },
        },
      ],
    },
    {
      label: '단지',
      icon: 'pi pi-building',
      items: [
        {
          label: '단지 목록',
          icon: 'pi pi-list',
          command: () => {
            navigate('/complexes/list')
          },
        },
        {
          label: '단지 등록',
          icon: 'pi pi-building',
          command: () => {
            navigate('/complexes/new')
          },
        },
      ],
    },
    {
      label: '업체',
      icon: 'pi pi-building',
      items: [
        {
          label: '업체 목록',
          icon: 'pi pi-list',
          command: () => {
            navigate('/vendors/list')
          },
        },
        {
          label: '업체 등록',
          icon: 'pi pi-users',
          command: () => {
            navigate('/vendors/new')
          },
        },
      ],
    },
    {
      label: '템플릿',
      icon: 'pi pi-file',
      items: [
        {
          label: '템플릿 목록',
          icon: 'pi pi-list',
          command: () => {
            navigate('/templates/list')
          },
        },
        {
          label: '템플릿 등록',
          icon: 'pi pi-file',
          command: () => {
            navigate('/templates/new')
          },
        },
      ],
    },
  ]

  const start = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <i className="pi pi-building" style={{ fontSize: '1.5rem' }}></i>
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>인창 LH 시스템</span>
    </div>
  )

  const end = (
    <Button
      label="로그아웃"
      icon="pi pi-sign-out"
      onClick={handleLogout}
      severity="secondary"
      outlined
    />
  )

  return <Menubar model={items} start={start} end={end} />
}

