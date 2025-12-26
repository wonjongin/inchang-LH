import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complexes/list" element={<ComplexesList />} />
        <Route path="/complexes/new" element={<ComplexesNew />} />
        <Route path="/complexes/edit/:complexId" element={<ComplexesEdit />} />
        <Route path="/vendors/list" element={<VendorsList />} />
        <Route path="/vendors/new" element={<VendorsNew />} />
        <Route path="/vendors/edit/:vendorId" element={<VendorsEdit />} />
        <Route path="/reservations/list" element={<ReservationsList />} />
        <Route path="/reservations/new" element={<ReservationsNew />} />
        <Route path="/reservations/edit/:reservationId" element={<ReservationsEdit />} />
        <Route path="/reservations/complete/:reservationId" element={<ReservationsComplete />} />
        <Route path="/templates/list" element={<TemplatesList />} />
        <Route path="/templates/new" element={<TemplatesNew />} />
        <Route path="/templates/edit/:templateId" element={<TemplatesEdit />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
