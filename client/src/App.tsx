import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import ComplexesList from './pages/complexes/ComplexesList'
import ComplexesNew from './pages/complexes/ComplexesNew'
import ComplexesEdit from './pages/complexes/ComplexesEdit'
import VendorsList from './pages/vendors/VendorsList'
import VendorsNew from './pages/vendors/VendorsNew'
import VendorsEdit from './pages/vendors/VendorsEdit'
import ReservationsList from './pages/reservation/ReservationsList'
import ReservationsNew from './pages/reservation/ReservationsNew'
import ReservationsEdit from './pages/reservation/ReservationsEdit'
import ReservationsComplete from './pages/reservation/ReservationsComplete'
import TemplatesList from './pages/templates/TemplatesList'
import TemplatesNew from './pages/templates/TemplatesNew'
import TemplatesEdit from './pages/templates/TemplatesEdit'
import './App.css'
import 'primereact/resources/themes/nano/theme.css'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const accessToken = localStorage.getItem('accessToken')?.trim()
  
  if (!accessToken) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/complexes/list" element={<ProtectedRoute><ComplexesList /></ProtectedRoute>} />
        <Route path="/complexes/new" element={<ProtectedRoute><ComplexesNew /></ProtectedRoute>} />
        <Route path="/complexes/edit/:complexId" element={<ProtectedRoute><ComplexesEdit /></ProtectedRoute>} />
        <Route path="/vendors/list" element={<ProtectedRoute><VendorsList /></ProtectedRoute>} />
        <Route path="/vendors/new" element={<ProtectedRoute><VendorsNew /></ProtectedRoute>} />
        <Route path="/vendors/edit/:vendorId" element={<ProtectedRoute><VendorsEdit /></ProtectedRoute>} />
        <Route path="/reservations/list" element={<ProtectedRoute><ReservationsList /></ProtectedRoute>} />
        <Route path="/reservations/new" element={<ProtectedRoute><ReservationsNew /></ProtectedRoute>} />
        <Route path="/reservations/edit/:reservationId" element={<ProtectedRoute><ReservationsEdit /></ProtectedRoute>} />
        <Route path="/reservations/complete/:reservationId" element={<ProtectedRoute><ReservationsComplete /></ProtectedRoute>} />
        <Route path="/templates/list" element={<ProtectedRoute><TemplatesList /></ProtectedRoute>} />
        <Route path="/templates/new" element={<ProtectedRoute><TemplatesNew /></ProtectedRoute>} />
        <Route path="/templates/edit/:templateId" element={<ProtectedRoute><TemplatesEdit /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
