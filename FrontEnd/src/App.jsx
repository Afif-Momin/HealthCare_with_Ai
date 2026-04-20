import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import MedicalHistory from './pages/MedicalHistory'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientForm from './pages/PatientForm'
import PatientView from './pages/PatientView'
import MedicalRecords from './pages/MedicalRecords'
import MedicalRecordForm from './pages/MedicalRecordForm'
import MedicalRecordView from './pages/MedicalRecordView'
import Appointments from './pages/Appointments'
import AppointmentForm from './pages/AppointmentForm'
import AppointmentView from './pages/AppointmentView'
import Prescriptions from './pages/Prescriptions'
import PrescriptionForm from './pages/PrescriptionForm'
import PrescriptionView from './pages/PrescriptionView'
import AIAnalysis from './pages/AIAnalysis'
import AIAnalysisForm from './pages/AIAnalysisForm'
import AIAnalysisView from './pages/AIAnalysisView'
import VoiceConsultation from './pages/VoiceConsultation'
import HealthStory from './pages/HealthStory'
import WhatIfSimulator from './pages/WhatIfSimulator'
import PopulationIntelligence from './pages/PopulationIntelligence'
import HospitalConnector from './pages/HospitalConnector'
import PredictiveTimeline from './pages/PredictiveTimeline'
import AdvancedDetection from './pages/AdvancedDetection'
import OutbreakDetection from './pages/OutbreakDetection'

/** Redirect to /login if not logged in, or redirect to / if route is forbidden for this role */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null

  return (
    <Routes>
      {/* Public → redirect to dashboard if already logged in */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />

      {/* All protected routes nested under Layout */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/medical-history" element={<MedicalHistory />} />

              {/* Patients — Admin, Doctor, Nurse */}
              <Route path="/patients" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR','NURSE']}><Patients /></ProtectedRoute>} />
              <Route path="/patients/new" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><PatientForm /></ProtectedRoute>} />
              <Route path="/patients/:id" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR','NURSE']}><PatientView /></ProtectedRoute>} />
              <Route path="/patients/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><PatientForm /></ProtectedRoute>} />

              {/* Medical Records */}
              <Route path="/medical-records" element={<MedicalRecords />} />
              <Route path="/medical-records/new" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><MedicalRecordForm /></ProtectedRoute>} />
              <Route path="/medical-records/:id" element={<MedicalRecordView />} />
              <Route path="/medical-records/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><MedicalRecordForm /></ProtectedRoute>} />

              {/* Appointments */}
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/appointments/new" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR','NURSE']}><AppointmentForm /></ProtectedRoute>} />
              <Route path="/appointments/:id" element={<AppointmentView />} />
              <Route path="/appointments/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR','NURSE']}><AppointmentForm /></ProtectedRoute>} />

              {/* Prescriptions */}
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/prescriptions/new" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><PrescriptionForm /></ProtectedRoute>} />
              <Route path="/prescriptions/:id" element={<PrescriptionView />} />
              <Route path="/prescriptions/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><PrescriptionForm /></ProtectedRoute>} />

              {/* AI Analysis — Admin, Doctor only */}
              <Route path="/ai-analysis" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><AIAnalysis /></ProtectedRoute>} />
              <Route path="/ai-analysis/new" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><AIAnalysisForm /></ProtectedRoute>} />
              <Route path="/ai-analysis/:id" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><AIAnalysisView /></ProtectedRoute>} />

              {/* Voice — Admin, Doctor only */}
              <Route path="/voice-consultation" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><VoiceConsultation /></ProtectedRoute>} />

              {/* Advanced — Admin, Doctor only */}
              <Route path="/advanced-detection" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><AdvancedDetection /></ProtectedRoute>} />
              <Route path="/population-intelligence" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><PopulationIntelligence /></ProtectedRoute>} />
              <Route path="/outbreak-detection" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><OutbreakDetection /></ProtectedRoute>} />
              <Route path="/health-story/:patientId" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><HealthStory /></ProtectedRoute>} />
              <Route path="/what-if/:patientId" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><WhatIfSimulator /></ProtectedRoute>} />
              <Route path="/hospitals/:patientId" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><HospitalConnector /></ProtectedRoute>} />
              <Route path="/predictive-timeline/:patientId" element={<ProtectedRoute allowedRoles={['ADMIN','DOCTOR']}><PredictiveTimeline /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
