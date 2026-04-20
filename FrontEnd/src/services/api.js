import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — anti-cache + auth token
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)

    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    config.headers['Pragma'] = 'no-cache'
    config.headers['Expires'] = '0'

    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }

    // Attach auth token from localStorage
    try {
      const stored = localStorage.getItem('innovaition_user')
      if (stored) {
        const user = JSON.parse(stored)
        if (user?.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`
        }
      }
    } catch (e) {}

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 404) {
        console.error('Resource not found:', data?.message || 'Not found')
      } else if (status === 400) {
        if (data?.errors) {
          const msgs = Object.entries(data.errors).map(([f, m]) => `${f}: ${m}`).join('\n')
          console.error('Validation errors:', msgs)
        } else {
          console.error('Bad request:', data?.message || 'Invalid request')
        }
      } else if (status === 500) {
        console.error('Server error:', data?.message || 'Internal server error')
      }
    } else if (error.request) {
      console.error('Network error: No response from server. Make sure the backend is running on port 8080.')
    } else {
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  getProfile: (email) => api.get(`/auth/profile/${encodeURIComponent(email)}`),
  updateProfile: (email, data) => api.put(`/auth/profile/${encodeURIComponent(email)}`, data),
}

// ── Patients API ─────────────────────────────────────────────────────────────
export const patientsAPI = {
  getAll: (search) => {
    const params = search ? { search } : {}
    return api.get('/patients', { params })
  },
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
}

// ── Medical Records API ───────────────────────────────────────────────────────
export const medicalRecordsAPI = {
  getAll: (patientId, recordType) => {
    const params = {}
    if (patientId) params.patientId = patientId
    if (recordType) params.recordType = recordType
    return api.get('/medical-records', { params })
  },
  getById: (id) => api.get(`/medical-records/${id}`),
  create: (data) => api.post('/medical-records', data),
  update: (id, data) => api.put(`/medical-records/${id}`, data),
  delete: (id) => api.delete(`/medical-records/${id}`),
}

// ── Appointments API ──────────────────────────────────────────────────────────
export const appointmentsAPI = {
  getAll: (patientId, status) => {
    const params = {}
    if (patientId) params.patientId = patientId
    if (status) params.status = status
    return api.get('/appointments', { params })
  },
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
}

// ── Prescriptions API ─────────────────────────────────────────────────────────
export const prescriptionsAPI = {
  getAll: (patientId, activeOnly) => {
    const params = {}
    if (patientId) params.patientId = patientId
    if (activeOnly !== undefined && activeOnly !== null) {
      params.activeOnly = activeOnly === true || activeOnly === 'true'
    }
    return api.get('/prescriptions', { params })
  },
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`),
}

// ── AI Analysis API ───────────────────────────────────────────────────────────
export const aiAnalysisAPI = {
  getAll: (patientId, analysisType) => {
    const params = {}
    if (patientId) params.patientId = patientId
    if (analysisType) params.analysisType = analysisType
    return api.get('/ai-analysis', { params })
  },
  getById: (id) => api.get(`/ai-analysis/${id}`),
  create: (data) => api.post('/ai-analysis', data),
  update: (id, data) => api.put(`/ai-analysis/${id}`, data),
  delete: (id) => api.delete(`/ai-analysis/${id}`),
}

// ── Health Check API ──────────────────────────────────────────────────────────
export const healthAPI = {
  check: () => api.get('/health'),
}

// ── Early Warning API ─────────────────────────────────────────────────────────
export const earlyWarningAPI = {
  detect: (region, timePeriod) => {
    const params = {}
    if (region) params.region = region
    if (timePeriod) params.timePeriod = timePeriod
    return api.get('/early-warning/detect', { params })
  },
}

// ── Digital Twin API ──────────────────────────────────────────────────────────
export const digitalTwinAPI = {
  getByPatient: (patientId) => api.get(`/digital-twin/patient/${patientId}`),
}

// ── Health Story API ──────────────────────────────────────────────────────────
export const healthStoryAPI = {
  getByPatient: (patientId) => api.get(`/health-story/patient/${patientId}`),
  askQuestion: (patientId, question) => api.post(`/health-story/patient/${patientId}/ask`, { question }),
}

// ── What-If Simulator API ─────────────────────────────────────────────────────
export const whatIfAPI = {
  simulate: (patientId, scenarioType, parameters) =>
    api.post(`/what-if/patient/${patientId}/simulate?scenarioType=${scenarioType}`, parameters),
}

// ── Population Intelligence API ───────────────────────────────────────────────
export const populationIntelligenceAPI = {
  analyzeAll: () => api.get('/population-intelligence/analyze-all'),
}

// ── Hospital Connector API ────────────────────────────────────────────────────
export const hospitalConnectorAPI = {
  findNearest: (patientId, analysisType, latitude, longitude) => {
    const params = { analysisType }
    if (latitude != null) params.latitude = latitude
    if (longitude != null) params.longitude = longitude
    return api.get(`/hospitals/nearest/${patientId}`, { params })
  },
  sendProfile: (patientId, hospitalEmail, isEmergency) =>
    api.post(`/hospitals/send-profile/${patientId}`, null, {
      params: { hospitalEmail, isEmergency }
    }),
}

// ── Predictive Timeline API ───────────────────────────────────────────────────
export const predictiveTimelineAPI = {
  generate: (patientId, healthInputs) =>
    api.post(`/predictive-timeline/patient/${patientId}`, healthInputs),
  getWithDefaults: (patientId) =>
    api.get(`/predictive-timeline/patient/${patientId}`),
  whatIf: (patientId, scenarioInputs) =>
    api.post(`/predictive-timeline/patient/${patientId}/what-if`, scenarioInputs),
  getInterventions: () =>
    api.get('/predictive-timeline/interventions'),
}

// ── SOS Emergency API ─────────────────────────────────────────────────────────
export const sosAPI = {
  triggerEmergency: (sosRequest) => api.post('/sos', sosRequest),
}

// ── Advanced AI Detection API (FastAPI) ───────────────────────────────────────
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8000'

const aiApi = axios.create({
  baseURL: AI_API_BASE_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
})

aiApi.interceptors.request.use(
  (config) => {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    config.headers['Pragma'] = 'no-cache'
    config.headers['Expires'] = '0'
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }
    if (config.method === 'post' && config.data instanceof FormData) {
      config.data.append('_t', Date.now().toString())
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const advancedDetectionAPI = {
  health: () => aiApi.get('/health'),
  retinalDisease: (formData) => aiApi.post('/api/v1/retinal-disease/predict', formData),
  skinCancer: (formData) => aiApi.post('/api/v1/skin-cancer/predict', formData),
  skinLesions: (formData) => aiApi.post('/api/v1/skin-lesions/predict', formData),
  parkinson: (formData) => aiApi.post('/api/v1/parkinson/predict', formData),
  gastro: (formData) => aiApi.post('/api/v1/gastro/predict', formData),
  lungCancer: (formData) => aiApi.post('/api/v1/lung-cancer/predict', formData),
  thyroid: (patientData) => axios.post(`${AI_API_BASE_URL}/api/v1/thyroid/predict`, patientData, {
    headers: { 'Content-Type': 'application/json' }
  }),
  retfound: (formData) => aiApi.post('/api/v1/retfound/predict', formData),
  retinalDiseaseBatch: (formData) => aiApi.post('/api/v1/batch/retinal-disease', formData),
}

export default api
