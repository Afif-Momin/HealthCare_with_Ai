import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Patients */}
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/:id" element={<PatientView />} />
          <Route path="/patients/:id/edit" element={<PatientForm />} />

          {/* Medical Records */}
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/medical-records/new" element={<MedicalRecordForm />} />
          <Route path="/medical-records/:id" element={<MedicalRecordView />} />
          <Route path="/medical-records/:id/edit" element={<MedicalRecordForm />} />

          {/* Appointments */}
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointments/new" element={<AppointmentForm />} />
          <Route path="/appointments/:id" element={<AppointmentView />} />
          <Route path="/appointments/:id/edit" element={<AppointmentForm />} />

          {/* Prescriptions */}
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/prescriptions/new" element={<PrescriptionForm />} />
          <Route path="/prescriptions/:id" element={<PrescriptionView />} />
          <Route path="/prescriptions/:id/edit" element={<PrescriptionForm />} />

          {/* AI Analysis */}
          <Route path="/ai-analysis" element={<AIAnalysis />} />
          <Route path="/ai-analysis/new" element={<AIAnalysisForm />} />
          <Route path="/ai-analysis/:id" element={<AIAnalysisView />} />

          {/* Voice Consultation */}
          <Route path="/voice-consultation" element={<VoiceConsultation />} />

          {/* New Features */}
          <Route path="/health-story/:patientId" element={<HealthStory />} />
          <Route path="/what-if/:patientId" element={<WhatIfSimulator />} />
          <Route path="/population-intelligence" element={<PopulationIntelligence />} />
          <Route path="/outbreak-detection" element={<OutbreakDetection />} />
          <Route path="/hospitals/:patientId" element={<HospitalConnector />} />
          <Route path="/predictive-timeline/:patientId" element={<PredictiveTimeline />} />

          {/* Advanced Visual & Audio Detection */}
          <Route path="/advanced-detection" element={<AdvancedDetection />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

