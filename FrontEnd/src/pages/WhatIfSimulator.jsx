import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import { whatIfAPI, patientsAPI } from '../services/api'

const WhatIfSimulator = () => {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [scenarioType, setScenarioType] = useState('lifestyle_change')
  const [parameters, setParameters] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (patientId) {
      fetchPatient()
    }
  }, [patientId])

  const fetchPatient = async () => {
    try {
      const response = await patientsAPI.getById(parseInt(patientId))
      setPatient(response.data)
    } catch (error) {
      console.error('Error fetching patient:', error)
    }
  }

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSimulate = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await whatIfAPI.simulate(parseInt(patientId), scenarioType, parameters)
      setResult(response.data)
    } catch (error) {
      console.error('Error simulating scenario:', error)
      setError('Failed to simulate scenario. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderScenarioInputs = () => {
    switch (scenarioType) {
      case 'lifestyle_change':
        return (
          <>
            <div className="form-group">
              <label>Exercise Level (hours/week)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={parameters.exerciseHours || ''}
                onChange={(e) => handleParameterChange('exerciseHours', e.target.value)}
                placeholder="e.g., 5"
              />
            </div>
            <div className="form-group">
              <label>Diet Change</label>
              <select
                value={parameters.diet || ''}
                onChange={(e) => handleParameterChange('diet', e.target.value)}
              >
                <option value="">Select diet</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Low Carb">Low Carb</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Keto">Keto</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sleep Hours (per night)</label>
              <input
                type="number"
                min="4"
                max="12"
                value={parameters.sleepHours || ''}
                onChange={(e) => handleParameterChange('sleepHours', e.target.value)}
                placeholder="e.g., 8"
              />
            </div>
          </>
        )
      case 'medication_change':
        return (
          <>
            <div className="form-group">
              <label>Medication Name</label>
              <input
                type="text"
                value={parameters.medicationName || ''}
                onChange={(e) => handleParameterChange('medicationName', e.target.value)}
                placeholder="e.g., Metformin"
              />
            </div>
            <div className="form-group">
              <label>Dosage (mg)</label>
              <input
                type="number"
                min="0"
                value={parameters.dosage || ''}
                onChange={(e) => handleParameterChange('dosage', e.target.value)}
                placeholder="e.g., 500"
              />
            </div>
            <div className="form-group">
              <label>Frequency</label>
              <select
                value={parameters.frequency || ''}
                onChange={(e) => handleParameterChange('frequency', e.target.value)}
              >
                <option value="">Select frequency</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
              </select>
            </div>
          </>
        )
      case 'surgery':
        return (
          <>
            <div className="form-group">
              <label>Surgery Type</label>
              <input
                type="text"
                value={parameters.surgeryType || ''}
                onChange={(e) => handleParameterChange('surgeryType', e.target.value)}
                placeholder="e.g., Bypass surgery"
              />
            </div>
            <div className="form-group">
              <label>Expected Recovery Time (weeks)</label>
              <input
                type="number"
                min="1"
                max="52"
                value={parameters.recoveryWeeks || ''}
                onChange={(e) => handleParameterChange('recoveryWeeks', e.target.value)}
                placeholder="e.g., 6"
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link 
        to={`/patients/${patientId}`} 
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
        Back to Patient
      </Link>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <Play size={48} style={{ marginBottom: '1rem' }} />
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
          What-If Outcome Simulator
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Simulate different scenarios and see potential health outcomes
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Input Panel */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Scenario Configuration</h2>
          
          <div className="form-group">
            <label>Patient</label>
            <input
              type="text"
              value={patient ? `${patient.firstName} ${patient.lastName}` : 'Loading...'}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Scenario Type</label>
            <select
              value={scenarioType}
              onChange={(e) => {
                setScenarioType(e.target.value)
                setParameters({})
                setResult(null)
              }}
            >
              <option value="lifestyle_change">Lifestyle Change</option>
              <option value="medication_change">Medication Change</option>
              <option value="surgery">Surgery</option>
              <option value="diet_modification">Diet Modification</option>
              <option value="exercise_regimen">Exercise Regimen</option>
            </select>
          </div>

          {renderScenarioInputs()}

          <button
            onClick={handleSimulate}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '1rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>Loading...</>
            ) : (
              <>
                <Play size={20} />
                Simulate Scenario
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Simulation Results</h2>
          
          {error && (
            <div style={{
              padding: '1rem',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {result ? (
            <div>
              {result.currentAnalysis && (
                <div style={{
                  padding: '1rem',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '0.5rem' }}>
                    Current Status
                  </div>
                  <div style={{ fontWeight: '600' }}>{result.currentAnalysis.type}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Confidence: {result.currentAnalysis.confidenceScore}
                  </div>
                </div>
              )}

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                borderRadius: '8px',
                border: '2px solid #10b981'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <CheckCircle size={24} color="#10b981" />
                  <h3 style={{ margin: 0, color: '#065f46' }}>Simulation Complete</h3>
                </div>
                
                <div style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.8',
                  color: '#374151'
                }}>
                  {typeof result.simulationResult === 'string' 
                    ? result.simulationResult 
                    : JSON.stringify(result.simulationResult, null, 2)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <Play size={48} color="#d1d5db" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Configure a scenario and click "Simulate" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WhatIfSimulator


