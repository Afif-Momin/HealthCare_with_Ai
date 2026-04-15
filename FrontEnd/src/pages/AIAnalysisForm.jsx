import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Save, ArrowLeft, Brain, AlertCircle, CheckCircle, Info, Mic } from 'lucide-react'
import { aiAnalysisAPI, patientsAPI, medicalRecordsAPI } from '../services/api'
import { getAnalysisRequirements, recordMatchesRequirement, autoSelectRequiredRecords } from '../utils/analysisRequirements'

const AIAnalysisForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [formData, setFormData] = useState({
    patientId: searchParams.get('patientId') || '',
    medicalRecordIds: [], // Changed to array for multi-select
    analysisType: '',
    inputData: '',
    modelVersion: 'v1.0',
    // Manual BP input for Blood Pressure analysis
    systolicBP: '',
    diastolicBP: '',
  })
  const [requirements, setRequirements] = useState({ required: [], recommended: [], description: '' })
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (formData.patientId) {
      fetchMedicalRecords()
    } else {
      setMedicalRecords([])
      setFormData(prev => ({ ...prev, medicalRecordId: '' }))
    }
  }, [formData.patientId])

  // Update requirements when analysis type changes
  useEffect(() => {
    if (formData.analysisType) {
      const reqs = getAnalysisRequirements(formData.analysisType)
      setRequirements(reqs)

      // Auto-select required records if patient and records are available
      if (formData.patientId && medicalRecords.length > 0) {
        const autoSelected = autoSelectRequiredRecords(medicalRecords, reqs)
        if (autoSelected.length > 0) {
          setFormData(prev => {
            // Only add if not already selected
            const newIds = [...prev.medicalRecordIds]
            autoSelected.forEach(id => {
              if (!newIds.includes(id)) {
                newIds.push(id)
              }
            })
            return {
              ...prev,
              medicalRecordIds: newIds
            }
          })
        }
      }
    } else {
      setRequirements({ required: [], recommended: [], description: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.analysisType])

  // Auto-select when medical records are loaded
  useEffect(() => {
    if (formData.analysisType && formData.patientId && medicalRecords.length > 0) {
      const reqs = getAnalysisRequirements(formData.analysisType)
      const autoSelected = autoSelectRequiredRecords(medicalRecords, reqs)
      if (autoSelected.length > 0) {
        setFormData(prev => {
          const newIds = [...prev.medicalRecordIds]
          autoSelected.forEach(id => {
            if (!newIds.includes(id)) {
              newIds.push(id)
            }
          })
          return {
            ...prev,
            medicalRecordIds: newIds
          }
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicalRecords])

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const fetchMedicalRecords = async () => {
    try {
      const response = await medicalRecordsAPI.getAll(parseInt(formData.patientId))
      setMedicalRecords(response.data)
    } catch (error) {
      console.error('Error fetching medical records:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear validation errors when user changes input
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Check if a record is required
  const isRecordRequired = (record) => {
    return requirements.required.some(req =>
      !req.isManual && recordMatchesRequirement(record, req)
    )
  }

  // Check if a record is recommended
  const isRecordRecommended = (record) => {
    return requirements.recommended.some(req =>
      !req.isManual && recordMatchesRequirement(record, req)
    )
  }

  // Validate required records and manual inputs
  const validateForm = () => {
    const errors = {}

    // Check required records
    const requiredRecordTypes = requirements.required.filter(req => !req.isManual)
    const selectedRecordTypes = formData.medicalRecordIds.map(id => {
      const record = medicalRecords.find(r => r.id === id)
      return record ? record.recordType : null
    })

    requiredRecordTypes.forEach(req => {
      const hasMatchingRecord = formData.medicalRecordIds.some(id => {
        const record = medicalRecords.find(r => r.id === id)
        return record && recordMatchesRequirement(record, req)
      })

      if (!hasMatchingRecord) {
        errors[`required_${req.type}`] = `${req.type} is required for this analysis type`
      }
    })

    // Check manual BP input for Blood Pressure analysis
    if (formData.analysisType === 'Blood Pressure' || formData.analysisType === 'Hypertension') {
      const bpRequired = requirements.required.find(req => req.isManual && req.type === 'Blood Pressure')
      if (bpRequired) {
        if (!formData.systolicBP || !formData.diastolicBP) {
          errors.bloodPressure = 'Systolic and Diastolic blood pressure values are required'
        } else {
          const systolic = parseInt(formData.systolicBP)
          const diastolic = parseInt(formData.diastolicBP)
          if (isNaN(systolic) || systolic < 50 || systolic > 250) {
            errors.systolicBP = 'Systolic BP must be between 50 and 250'
          }
          if (isNaN(diastolic) || diastolic < 30 || diastolic > 150) {
            errors.diastolicBP = 'Diastolic BP must be between 30 and 150'
          }
        }
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting.')
      return
    }

    setLoading(true)
    try {
      // Build input data with records and manual inputs
      let combinedInputData = formData.inputData

      // Add manual BP input if provided
      if (formData.systolicBP && formData.diastolicBP) {
        combinedInputData = `Blood Pressure: ${formData.systolicBP}/${formData.diastolicBP} mmHg\n\n` + combinedInputData
      }

      // If multiple records selected, combine their data
      if (formData.medicalRecordIds.length > 0) {
        const selectedRecords = medicalRecords.filter(r => formData.medicalRecordIds.includes(r.id))
        const recordsData = selectedRecords.map(r =>
          `[${r.recordType}] ${r.title}\n${r.description || ''}\n${r.diagnosis || ''}\n${r.symptoms || ''}\n${r.treatment || ''}\n${r.notes || ''}`
        ).join('\n\n---\n\n')
        combinedInputData = recordsData + (combinedInputData ? '\n\nAdditional Notes:\n' + combinedInputData : '')
      }

      const submitData = {
        patientId: parseInt(formData.patientId),
        medicalRecordId: formData.medicalRecordIds.length === 1 ? parseInt(formData.medicalRecordIds[0]) : null,
        medicalRecordIds: formData.medicalRecordIds.length > 1 ? formData.medicalRecordIds.map(id => parseInt(id)) : null,
        analysisType: formData.analysisType,
        inputData: combinedInputData,
        modelVersion: formData.modelVersion || 'v1.0',
      }
      const response = await aiAnalysisAPI.create(submitData)
      navigate(`/ai-analysis/${response.data.id}`)
    } catch (error) {
      let errorMessage = 'Error creating AI analysis'
      if (error.response?.data?.errors) {
        const errors = Object.entries(error.response.data.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n')
        errorMessage = `Validation errors:\n${errors}`
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      alert(errorMessage)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/ai-analysis"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-light)',
            textDecoration: 'none',
            marginBottom: '1rem'
          }}
        >
          <ArrowLeft size={18} />
          Back to AI Analysis
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain size={28} />
          New AI Analysis
        </h1>
        <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
          Create a new AI-powered medical analysis using Google Gemini
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Patient *</label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Medical Records
                {requirements.required.length > 0 && (
                  <span style={{ color: '#ef4444', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                    * Required
                  </span>
                )}
              </label>

              {/* Requirements Info */}
              {formData.analysisType && requirements.description && (
                <div style={{
                  marginBottom: '0.75rem',
                  padding: '0.75rem',
                  background: '#f0f9ff',
                  borderRadius: '6px',
                  border: '1px solid #bae6fd',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Info size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.25rem' }}>
                        Requirements for {formData.analysisType}:
                      </div>
                      {requirements.required.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '0.25rem' }}>
                            Required:
                          </div>
                          {requirements.required.map((req, idx) => (
                            <div key={idx} style={{ color: '#991b1b', marginLeft: '1rem', marginBottom: '0.25rem' }}>
                              ✅ {req.type}
                              {req.fields && req.fields.length > 0 && (
                                <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                                  {' '}({req.fields.join(', ')})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {requirements.recommended.length > 0 && (
                        <div>
                          <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '0.25rem' }}>
                            Recommended:
                          </div>
                          {requirements.recommended.map((req, idx) => (
                            <div key={idx} style={{ color: '#92400e', marginLeft: '1rem', marginBottom: '0.25rem' }}>
                              ➕ {req.type}
                              {req.fields && req.fields.length > 0 && (
                                <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                                  {' '}({req.fields.join(', ')})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                padding: '0.75rem',
                background: formData.patientId && medicalRecords.length === 0 ? '#f9fafb' : 'var(--bg-card)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {!formData.patientId ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', margin: 0, padding: '0.5rem' }}>
                    Select a patient first
                  </p>
                ) : medicalRecords.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', margin: 0, padding: '0.5rem' }}>
                    No medical records found for this patient
                  </p>
                ) : (
                  medicalRecords.map((record) => {
                    const isRequired = isRecordRequired(record)
                    const isRecommended = isRecordRecommended(record)
                    const isSelected = formData.medicalRecordIds.includes(record.id)

                    return (
                      <label
                        key={record.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          marginBottom: '0.25rem',
                          background: isSelected
                            ? (isRequired
                              ? '#fee2e2'
                              : isRecommended
                                ? '#fef3c7'
                                : '#dbeafe') // Blue for regular selected items
                            : (isRequired
                              ? '#fef2f2'
                              : isRecommended
                                ? '#fffbeb'
                                : 'transparent'),
                          border: isSelected
                            ? (isRequired
                              ? '2px solid #ef4444'
                              : isRecommended
                                ? '2px solid #f59e0b'
                                : '2px solid #3b82f6') // Blue border for selected
                            : (isRequired
                              ? '1px solid #fecaca'
                              : isRecommended
                                ? '1px solid #fde68a'
                                : '1px solid #e5e7eb'),
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = isRequired
                              ? '#fef2f2'
                              : isRecommended
                                ? '#fffbeb'
                                : 'transparent'
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                medicalRecordIds: [...prev.medicalRecordIds, record.id]
                              }))
                            } else {
                              // Don't allow unchecking required records
                              if (!isRequired) {
                                setFormData(prev => ({
                                  ...prev,
                                  medicalRecordIds: prev.medicalRecordIds.filter(id => id !== record.id)
                                }))
                              }
                            }
                          }}
                          style={{ cursor: isRequired && isSelected ? 'not-allowed' : 'pointer' }}
                          disabled={isRequired && isSelected}
                        />
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', flex: 1, color: isSelected ? '#000000' : '#ffffff' }}>
                            {record.title} - {record.recordType}
                          </span>
                          {isRequired && (
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: '#fee2e2',
                              color: '#991b1b',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}>
                              Required
                            </span>
                          )}
                          {isRecommended && !isRequired && (
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: '#fef3c7',
                              color: '#92400e',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}>
                              Recommended
                            </span>
                          )}
                        </div>
                      </label>
                    )
                  })
                )}
              </div>

              {/* Validation Errors */}
              {Object.keys(validationErrors).some(key => key.startsWith('required_')) && (
                <div style={{ marginTop: '0.5rem' }}>
                  {Object.entries(validationErrors)
                    .filter(([key]) => key.startsWith('required_'))
                    .map(([key, message]) => (
                      <div key={key} style={{
                        fontSize: '0.75rem',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginBottom: '0.25rem'
                      }}>
                        <AlertCircle size={14} />
                        {message}
                      </div>
                    ))}
                </div>
              )}

              {formData.medicalRecordIds.length > 0 && (
                <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem' }}>
                  {formData.medicalRecordIds.length} record(s) selected
                </p>
              )}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Analysis Type *</label>
              <select
                name="analysisType"
                value={formData.analysisType}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Analysis Type</option>
                <option value="General Analysis">General Analysis</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Heart Attack/ECG">Heart Attack/ECG</option>
                <option value="MRI/Tumor">MRI/Tumor</option>
                <option value="Blood Pressure">Blood Pressure</option>
                <option value="TB">TB</option>
                <option value="Blood Report Analysis">Blood Report Analysis</option>
              </select>
            </div>

            {/* Manual Blood Pressure Input */}
            {formData.analysisType === 'Blood Pressure' && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">
                  Blood Pressure (Required) *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>
                      Systolic (mmHg) *
                    </label>
                    <input
                      type="number"
                      name="systolicBP"
                      value={formData.systolicBP}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="120"
                      min="50"
                      max="250"
                      required
                      style={{
                        borderColor: validationErrors.systolicBP ? '#ef4444' : undefined
                      }}
                    />
                    {validationErrors.systolicBP && (
                      <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                        {validationErrors.systolicBP}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>
                      Diastolic (mmHg) *
                    </label>
                    <input
                      type="number"
                      name="diastolicBP"
                      value={formData.diastolicBP}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="80"
                      min="30"
                      max="150"
                      required
                      style={{
                        borderColor: validationErrors.diastolicBP ? '#ef4444' : undefined
                      }}
                    />
                    {validationErrors.diastolicBP && (
                      <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                        {validationErrors.diastolicBP}
                      </p>
                    )}
                  </div>
                </div>
                {formData.systolicBP && formData.diastolicBP && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#ecfdf5',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: '#065f46'
                  }}>
                    <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Blood Pressure: {formData.systolicBP}/{formData.diastolicBP} mmHg
                  </div>
                )}
                {validationErrors.bloodPressure && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={14} />
                    {validationErrors.bloodPressure}
                  </p>
                )}
              </div>
            )}

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Input Data *</label>
              <textarea
                name="inputData"
                value={formData.inputData}
                onChange={handleChange}
                className="form-textarea"
                rows="6"
                required
                placeholder="Enter medical data, symptoms, test results, or any information to analyze. For example: Patient presents with fever (38.5°C), persistent cough for 5 days, fatigue, and mild shortness of breath."
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                Provide detailed medical information for accurate AI analysis
              </p>
            </div>

          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)'
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
            <strong>Note:</strong> This analysis will use Google Gemini AI to process the medical information.
            The results are for informational purposes only and should not replace professional medical consultation.
          </p>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link
            to={`/voice-consultation?patientId=${formData.patientId}&symptoms=${encodeURIComponent(formData.inputData)}`}
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              opacity: formData.patientId ? 1 : 0.6,
              pointerEvents: formData.patientId ? 'auto' : 'none'
            }}
          >
            <Mic size={18} />
            Start Voice Consultation
          </Link>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/ai-analysis" className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Brain size={18} />
              {loading ? 'Processing...' : 'Create Analysis'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AIAnalysisForm

