import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { 
  Save, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Heart,
  AlertCircle,
  Shield,
  Sparkles,
  Activity,
  Dumbbell,
  Utensils,
  Moon,
  Wine,
  Cigarette,
  Users,
  Pill,
  Brain,
  Scale,
  Droplet,
  Thermometer,
  TrendingUp
} from 'lucide-react'
import { patientsAPI } from '../services/api'
import { formatDateInput } from '../utils/dateUtils'

const FormSection = ({ title, icon: Icon, color, children }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1.25rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        background: `${color}15`,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={18} color={color} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{title}</h3>
    </div>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.25rem'
    }}>
      {children}
    </div>
  </div>
)

const PatientForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('basic')
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    
    // Body Measurements
    height: '',
    weight: '',
    
    // Vital Signs & Biomarkers
    systolicBP: '',
    diastolicBP: '',
    restingHeartRate: '',
    totalCholesterol: '',
    ldlCholesterol: '',
    hdlCholesterol: '',
    triglycerides: '',
    fastingGlucose: '',
    hba1c: '',
    
    // Lifestyle - Smoking
    smoker: false,
    smokingYears: '',
    cigarettesPerDay: '',
    formerSmoker: false,
    yearsQuitSmoking: '',
    
    // Lifestyle - Alcohol
    alcoholConsumption: 'none',
    drinksPerWeek: '',
    
    // Lifestyle - Exercise
    exerciseHoursPerWeek: '',
    exerciseIntensity: 'moderate',
    sedentaryHoursPerDay: '',
    
    // Lifestyle - Diet
    diet: 'average',
    dailyVegetableServings: '',
    dailyFruitServings: '',
    processedFoodFrequency: 'sometimes',
    
    // Lifestyle - Sleep & Stress
    sleepHoursPerNight: '',
    sleepQuality: 'fair',
    stressLevel: 'moderate',
    
    // Medical Conditions
    diabetic: false,
    diabetesType: 'none',
    onBPMeds: false,
    onCholesterolMeds: false,
    onDiabetesMeds: false,
    otherMedications: '',
    
    // Past Medical Events
    hadHeartAttack: false,
    hadStroke: false,
    hasChronicKidneyDisease: false,
    hasAutoImmuneDisorder: false,
    hasArrhythmia: false,
    hasAnxiety: false,
    hasDepression: false,
    
    // Family History
    familyHistoryHeartDisease: false,
    familyHeartDiseaseAge: '',
    familyHistoryDiabetes: false,
    familyHistoryStroke: false,
    familyHistoryCancer: false,
    familyCancerTypes: '',
    familyHistoryHypertension: false,
    familyHistoryObesity: false,
    
    // Environment
    occupation: 'office',
    exposureToToxins: false,
    airQualityIndex: 'good',
    socialConnections: 'moderate',
  })

  useEffect(() => {
    if (isEdit && id) {
      fetchPatient()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit])

  const fetchPatient = async () => {
    try {
      const response = await patientsAPI.getById(id)
      const p = response.data
      setFormData({
        // Basic Info
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        email: p.email || '',
        phoneNumber: p.phoneNumber || '',
        dateOfBirth: formatDateInput(p.dateOfBirth) || '',
        gender: p.gender || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        zipCode: p.zipCode || '',
        country: p.country || '',
        bloodGroup: p.bloodGroup || '',
        allergies: p.allergies || '',
        medicalHistory: p.medicalHistory || '',
        emergencyContactName: p.emergencyContactName || '',
        emergencyContactPhone: p.emergencyContactPhone || '',
        
        // Body Measurements
        height: p.height || '',
        weight: p.weight || '',
        
        // Vital Signs
        systolicBP: p.systolicBP || '',
        diastolicBP: p.diastolicBP || '',
        restingHeartRate: p.restingHeartRate || '',
        totalCholesterol: p.totalCholesterol || '',
        ldlCholesterol: p.ldlCholesterol || '',
        hdlCholesterol: p.hdlCholesterol || '',
        triglycerides: p.triglycerides || '',
        fastingGlucose: p.fastingGlucose || '',
        hba1c: p.hba1c || '',
        
        // Smoking
        smoker: p.smoker || false,
        smokingYears: p.smokingYears || '',
        cigarettesPerDay: p.cigarettesPerDay || '',
        formerSmoker: p.formerSmoker || false,
        yearsQuitSmoking: p.yearsQuitSmoking || '',
        
        // Alcohol
        alcoholConsumption: p.alcoholConsumption || 'none',
        drinksPerWeek: p.drinksPerWeek || '',
        
        // Exercise
        exerciseHoursPerWeek: p.exerciseHoursPerWeek || '',
        exerciseIntensity: p.exerciseIntensity || 'moderate',
        sedentaryHoursPerDay: p.sedentaryHoursPerDay || '',
        
        // Diet
        diet: p.diet || 'average',
        dailyVegetableServings: p.dailyVegetableServings || '',
        dailyFruitServings: p.dailyFruitServings || '',
        processedFoodFrequency: p.processedFoodFrequency || 'sometimes',
        
        // Sleep & Stress
        sleepHoursPerNight: p.sleepHoursPerNight || '',
        sleepQuality: p.sleepQuality || 'fair',
        stressLevel: p.stressLevel || 'moderate',
        
        // Medical Conditions
        diabetic: p.diabetic || false,
        diabetesType: p.diabetesType || 'none',
        onBPMeds: p.onBPMeds || false,
        onCholesterolMeds: p.onCholesterolMeds || false,
        onDiabetesMeds: p.onDiabetesMeds || false,
        otherMedications: p.otherMedications || '',
        
        // Past Events
        hadHeartAttack: p.hadHeartAttack || false,
        hadStroke: p.hadStroke || false,
        hasChronicKidneyDisease: p.hasChronicKidneyDisease || false,
        hasAutoImmuneDisorder: p.hasAutoImmuneDisorder || false,
        hasArrhythmia: p.hasArrhythmia || false,
        hasAnxiety: p.hasAnxiety || false,
        hasDepression: p.hasDepression || false,
        
        // Family History
        familyHistoryHeartDisease: p.familyHistoryHeartDisease || false,
        familyHeartDiseaseAge: p.familyHeartDiseaseAge || '',
        familyHistoryDiabetes: p.familyHistoryDiabetes || false,
        familyHistoryStroke: p.familyHistoryStroke || false,
        familyHistoryCancer: p.familyHistoryCancer || false,
        familyCancerTypes: p.familyCancerTypes || '',
        familyHistoryHypertension: p.familyHistoryHypertension || false,
        familyHistoryObesity: p.familyHistoryObesity || false,
        
        // Environment
        occupation: p.occupation || 'office',
        exposureToToxins: p.exposureToToxins || false,
        airQualityIndex: p.airQualityIndex || 'good',
        socialConnections: p.socialConnections || 'moderate',
      })
    } catch (error) {
      console.error('Error fetching patient:', error)
      alert('Error loading patient data')
    }
  }

  // Optimized handleChange to prevent focus loss
  // Keep number inputs as strings to prevent focus loss during typing
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value, // Keep numbers as strings for now
    }))
  }, [])
  
  // Convert number strings to actual numbers on blur (when user leaves the field)
  const handleNumberBlur = useCallback((e) => {
    const { name, value } = e.target
    if (value !== '' && !isNaN(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value),
      }))
    }
  }, [])
  
  // Calculate Age from date of birth
  const calculateAge = () => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age >= 0 ? age : null
    }
    return null
  }
  
  // Calculate BMI
  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightM = Number(formData.height) / 100
      const weight = Number(formData.weight)
      return (weight / (heightM * heightM)).toFixed(1)
    }
    return null
  }
  
  const age = calculateAge()
  const bmi = calculateBMI()
  const getBMICategory = (bmi) => {
    if (!bmi) return null
    const bmiNum = parseFloat(bmi)
    if (bmiNum < 18.5) return { text: 'Underweight', color: '#f59e0b' }
    if (bmiNum < 25) return { text: 'Normal', color: '#10b981' }
    if (bmiNum < 30) return { text: 'Overweight', color: '#f59e0b' }
    return { text: 'Obese', color: '#ef4444' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Convert number string fields to actual numbers (or null if empty)
      const numberFields = [
        'height', 'weight', 'systolicBP', 'diastolicBP', 'restingHeartRate',
        'totalCholesterol', 'ldlCholesterol', 'hdlCholesterol', 'triglycerides',
        'fastingGlucose', 'hba1c', 'smokingYears', 'cigarettesPerDay',
        'yearsQuitSmoking', 'drinksPerWeek', 'exerciseHoursPerWeek',
        'sedentaryHoursPerDay', 'dailyVegetableServings', 'dailyFruitServings',
        'sleepHoursPerNight', 'familyHeartDiseaseAge'
      ]
      
      const submitData = { ...formData }
      
      // Convert number fields
      numberFields.forEach(field => {
        if (submitData[field] !== '' && submitData[field] !== null && submitData[field] !== undefined) {
          const numValue = Number(submitData[field])
          submitData[field] = isNaN(numValue) ? null : numValue
        } else {
          submitData[field] = null
        }
      })
      
      submitData.dateOfBirth = submitData.dateOfBirth || null
      
      if (isEdit) {
        await patientsAPI.update(id, submitData)
      } else {
        await patientsAPI.create(submitData)
      }
      navigate('/patients')
    } catch (error) {
      let errorMessage = 'Error saving patient'
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '2rem',
        animation: 'fadeInUp 0.5s ease forwards',
      }}>
        <Link 
          to="/patients" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} />
          Back to Patients
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: isEdit 
              ? 'linear-gradient(135deg, #ffd700, #ff6b6b)'
              : 'linear-gradient(135deg, #00ff88, #00d4ff)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isEdit 
              ? '0 4px 20px rgba(255, 215, 0, 0.3)'
              : '0 4px 20px rgba(0, 255, 136, 0.3)',
          }}>
            {isEdit ? <User size={28} color="white" /> : <Sparkles size={28} color="white" />}
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '800',
              marginBottom: '0.25rem',
            }}>
              {isEdit ? 'Edit Patient' : 'Add New Patient'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isEdit ? 'Update patient information' : 'Register a new patient in the system'}
            </p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        background: 'var(--bg-card)',
        padding: '0.5rem',
        borderRadius: '12px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'basic', label: 'Basic Info', icon: User },
          { id: 'health', label: 'Health Profile', icon: TrendingUp },
          { id: 'lifestyle', label: 'Lifestyle', icon: Dumbbell },
          { id: 'medical', label: 'Medical History', icon: Pill },
          { id: 'family', label: 'Family History', icon: Users }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            style={{
              flex: '1 1 auto',
              minWidth: '100px',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.8rem',
              transition: 'all 0.2s',
              background: activeSection === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: activeSection === tab.id ? 'white' : 'var(--text-secondary)'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Section */}
        {activeSection === 'basic' && (
          <>
            <FormSection title="Personal Information" icon={User} color="#7c3aed">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" placeholder="Enter first name" required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" placeholder="Enter last name" required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date of Birth *</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    value={formData.dateOfBirth} 
                    onChange={handleChange} 
                    className="form-input" 
                    required 
                    style={{ flex: 1 }}
                  />
                  {age !== null && (
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #667eea15, #764ba215)',
                      border: '1px solid #667eea30',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#667eea',
                      whiteSpace: 'nowrap'
                    }}>
                      Age: {age} years
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </FormSection>

            <FormSection title="Contact Information" icon={Mail} color="#00d4ff">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="email@example.com" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="form-input" placeholder="+1 (555) 000-0000" />
              </div>
            </FormSection>

            <FormSection title="Address" icon={MapPin} color="#00ff88">
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Street Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-input" placeholder="123 Main Street" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" placeholder="City name" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="form-input" placeholder="State" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Zip Code</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="form-input" placeholder="12345" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="form-input" placeholder="Country" />
              </div>
            </FormSection>

            <FormSection title="Emergency Contact" icon={Shield} color="#ffd700">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Contact Name</label>
                <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="form-input" placeholder="Emergency contact name" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Contact Phone</label>
                <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className="form-input" placeholder="Emergency contact phone" />
              </div>
            </FormSection>
          </>
        )}

        {/* Health Profile Section */}
        {activeSection === 'health' && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px solid #667eea30',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <TrendingUp size={24} color="#667eea" />
              <div>
                <strong style={{ color: '#667eea' }}>Health Profile for Predictive Analysis</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  This data is used for AI-powered health predictions and risk calculations.
                </p>
              </div>
            </div>

            <FormSection title="Body Measurements" icon={Scale} color="#10b981">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} className="form-input" placeholder="170" min="100" max="250" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="form-input" placeholder="70" min="30" max="300" />
              </div>
              {bmi && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Calculated BMI</label>
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: `${getBMICategory(bmi)?.color}15`,
                    border: `2px solid ${getBMICategory(bmi)?.color}`,
                    fontWeight: '700',
                    color: getBMICategory(bmi)?.color,
                    textAlign: 'center'
                  }}>
                    {bmi} ({getBMICategory(bmi)?.text})
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="Vital Signs & Blood Work" icon={Heart} color="#ef4444">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Systolic BP (mmHg)</label>
                <input type="number" name="systolicBP" value={formData.systolicBP} onChange={handleChange} className="form-input" placeholder="120" min="80" max="250" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Diastolic BP (mmHg)</label>
                <input type="number" name="diastolicBP" value={formData.diastolicBP} onChange={handleChange} className="form-input" placeholder="80" min="40" max="150" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Resting Heart Rate (bpm)</label>
                <input type="number" name="restingHeartRate" value={formData.restingHeartRate} onChange={handleChange} className="form-input" placeholder="72" min="40" max="200" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Total Cholesterol (mg/dL)</label>
                <input type="number" name="totalCholesterol" value={formData.totalCholesterol} onChange={handleChange} className="form-input" placeholder="200" min="100" max="400" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">HDL Cholesterol (mg/dL)</label>
                <input type="number" name="hdlCholesterol" value={formData.hdlCholesterol} onChange={handleChange} className="form-input" placeholder="50" min="20" max="120" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">LDL Cholesterol (mg/dL)</label>
                <input type="number" name="ldlCholesterol" value={formData.ldlCholesterol} onChange={handleChange} className="form-input" placeholder="130" min="40" max="300" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Triglycerides (mg/dL)</label>
                <input type="number" name="triglycerides" value={formData.triglycerides} onChange={handleChange} className="form-input" placeholder="150" min="50" max="500" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fasting Glucose (mg/dL)</label>
                <input type="number" name="fastingGlucose" value={formData.fastingGlucose} onChange={handleChange} className="form-input" placeholder="95" min="50" max="400" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">HbA1c (%)</label>
                <input type="number" step="0.1" name="hba1c" value={formData.hba1c} onChange={handleChange} className="form-input" placeholder="5.5" min="4" max="15" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-select">
                  <option value="">Select</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
            </FormSection>
          </>
        )}

        {/* Lifestyle Section */}
        {activeSection === 'lifestyle' && (
          <>
            <FormSection title="Smoking" icon={Cigarette} color="#ef4444">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="smoker" checked={formData.smoker} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                  <span className="form-label" style={{ marginBottom: 0 }}>Currently Smoking</span>
                </label>
              </div>
              {formData.smoker && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cigarettes/Day</label>
                    <input type="number" name="cigarettesPerDay" value={formData.cigarettesPerDay} onChange={handleChange} className="form-input" placeholder="10" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Years Smoking</label>
                    <input type="number" name="smokingYears" value={formData.smokingYears} onChange={handleChange} className="form-input" placeholder="5" />
                  </div>
                </>
              )}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="formerSmoker" checked={formData.formerSmoker} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                  <span className="form-label" style={{ marginBottom: 0 }}>Former Smoker</span>
                </label>
              </div>
              {formData.formerSmoker && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Years Since Quitting</label>
                  <input type="number" name="yearsQuitSmoking" value={formData.yearsQuitSmoking} onChange={handleChange} className="form-input" placeholder="2" />
                </div>
              )}
            </FormSection>

            <FormSection title="Exercise & Activity" icon={Dumbbell} color="#10b981">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Exercise Hours/Week</label>
                <input type="number" name="exerciseHoursPerWeek" value={formData.exerciseHoursPerWeek} onChange={handleChange} className="form-input" placeholder="3" min="0" max="40" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Exercise Intensity</label>
                <select name="exerciseIntensity" value={formData.exerciseIntensity} onChange={handleChange} className="form-select">
                  <option value="light">🚶 Light (walking, stretching)</option>
                  <option value="moderate">🏃 Moderate (jogging, cycling)</option>
                  <option value="vigorous">💪 Vigorous (running, HIIT)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sedentary Hours/Day</label>
                <input type="number" name="sedentaryHoursPerDay" value={formData.sedentaryHoursPerDay} onChange={handleChange} className="form-input" placeholder="8" min="0" max="24" />
              </div>
            </FormSection>

            <FormSection title="Diet & Nutrition" icon={Utensils} color="#f59e0b">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Diet Type</label>
                <select name="diet" value={formData.diet} onChange={handleChange} className="form-select">
                  <option value="poor">🍔 Poor</option>
                  <option value="average">🍕 Average</option>
                  <option value="healthy">🥗 Healthy</option>
                  <option value="mediterranean">🫒 Mediterranean</option>
                  <option value="keto">🥓 Keto</option>
                  <option value="vegan">🥬 Vegan</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Vegetable Servings/Day</label>
                <input type="number" name="dailyVegetableServings" value={formData.dailyVegetableServings} onChange={handleChange} className="form-input" placeholder="3" min="0" max="15" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fruit Servings/Day</label>
                <input type="number" name="dailyFruitServings" value={formData.dailyFruitServings} onChange={handleChange} className="form-input" placeholder="2" min="0" max="15" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Processed Food Frequency</label>
                <select name="processedFoodFrequency" value={formData.processedFoodFrequency} onChange={handleChange} className="form-select">
                  <option value="rarely">🌟 Rarely</option>
                  <option value="sometimes">⚡ Sometimes</option>
                  <option value="often">⚠️ Often</option>
                  <option value="daily">🚨 Daily</option>
                </select>
              </div>
            </FormSection>

            <FormSection title="Alcohol" icon={Wine} color="#8b5cf6">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Consumption Level</label>
                <select name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleChange} className="form-select">
                  <option value="none">🚫 None</option>
                  <option value="light">🍷 Light (1-3/week)</option>
                  <option value="moderate">🍺 Moderate (4-7/week)</option>
                  <option value="heavy">🍻 Heavy (8+/week)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Drinks Per Week</label>
                <input type="number" name="drinksPerWeek" value={formData.drinksPerWeek} onChange={handleChange} className="form-input" placeholder="3" min="0" max="50" />
              </div>
            </FormSection>

            <FormSection title="Sleep & Stress" icon={Moon} color="#3b82f6">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sleep Hours/Night</label>
                <input type="number" name="sleepHoursPerNight" value={formData.sleepHoursPerNight} onChange={handleChange} className="form-input" placeholder="7" min="3" max="12" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sleep Quality</label>
                <select name="sleepQuality" value={formData.sleepQuality} onChange={handleChange} className="form-select">
                  <option value="poor">😴 Poor</option>
                  <option value="fair">😐 Fair</option>
                  <option value="good">😊 Good</option>
                  <option value="excellent">🌟 Excellent</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Stress Level</label>
                <select name="stressLevel" value={formData.stressLevel} onChange={handleChange} className="form-select">
                  <option value="low">😌 Low</option>
                  <option value="moderate">😐 Moderate</option>
                  <option value="high">😰 High</option>
                  <option value="very_high">😫 Very High</option>
                </select>
              </div>
            </FormSection>
          </>
        )}

        {/* Medical History Section */}
        {activeSection === 'medical' && (
          <>
            <FormSection title="Current Conditions" icon={Activity} color="#ef4444">
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {[
                  { name: 'diabetic', label: 'Diabetes' },
                  { name: 'hasChronicKidneyDisease', label: 'Chronic Kidney Disease' },
                  { name: 'hasAutoImmuneDisorder', label: 'Autoimmune Disorder' },
                  { name: 'hasArrhythmia', label: 'Heart Arrhythmia' },
                  { name: 'hasAnxiety', label: 'Anxiety' },
                  { name: 'hasDepression', label: 'Depression' }
                ].map(item => (
                  <label key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: formData[item.name] ? '#fee2e220' : 'var(--bg)', borderRadius: '8px', border: `1px solid ${formData[item.name] ? '#ef4444' : 'var(--border-subtle)'}` }}>
                    <input type="checkbox" name={item.name} checked={formData[item.name]} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                    {item.label}
                  </label>
                ))}
              </div>
              {formData.diabetic && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Diabetes Type</label>
                  <select name="diabetesType" value={formData.diabetesType} onChange={handleChange} className="form-select">
                    <option value="none">None</option>
                    <option value="prediabetes">Prediabetes</option>
                    <option value="type1">Type 1</option>
                    <option value="type2">Type 2</option>
                  </select>
                </div>
              )}
            </FormSection>

            <FormSection title="Past Medical Events" icon={AlertCircle} color="#f97316">
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1rem', background: formData.hadHeartAttack ? '#fee2e2' : 'var(--bg)', borderRadius: '8px', border: `1px solid ${formData.hadHeartAttack ? '#ef4444' : 'var(--border-subtle)'}` }}>
                  <input type="checkbox" name="hadHeartAttack" checked={formData.hadHeartAttack} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  Previous Heart Attack
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1rem', background: formData.hadStroke ? '#fee2e2' : 'var(--bg)', borderRadius: '8px', border: `1px solid ${formData.hadStroke ? '#ef4444' : 'var(--border-subtle)'}` }}>
                  <input type="checkbox" name="hadStroke" checked={formData.hadStroke} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  Previous Stroke
                </label>
              </div>
            </FormSection>

            <FormSection title="Current Medications" icon={Pill} color="#10b981">
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[
                  { name: 'onBPMeds', label: 'Blood Pressure Medication' },
                  { name: 'onCholesterolMeds', label: 'Cholesterol Medication (Statins)' },
                  { name: 'onDiabetesMeds', label: 'Diabetes Medication' }
                ].map(item => (
                  <label key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1rem', background: formData[item.name] ? '#dcfce7' : 'var(--bg)', borderRadius: '8px', border: `1px solid ${formData[item.name] ? '#10b981' : 'var(--border-subtle)'}` }}>
                    <input type="checkbox" name={item.name} checked={formData[item.name]} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                    {item.label}
                  </label>
                ))}
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Other Medications</label>
                <textarea name="otherMedications" value={formData.otherMedications} onChange={handleChange} className="form-textarea" placeholder="List any other medications..." rows={2} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label"><AlertCircle size={14} color="#ff6b6b" style={{ display: 'inline', marginRight: '0.5rem' }} />Allergies</label>
                <textarea name="allergies" value={formData.allergies} onChange={handleChange} className="form-textarea" placeholder="List any allergies..." rows={2} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Medical History Notes</label>
                <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} className="form-textarea" placeholder="Previous surgeries, conditions..." rows={3} />
              </div>
            </FormSection>
          </>
        )}

        {/* Family History Section */}
        {activeSection === 'family' && (
          <>
            <FormSection title="Family Medical History" icon={Users} color="#8b5cf6">
              <p style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Select conditions that affect first-degree relatives (parents, siblings)
              </p>
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {[
                  { name: 'familyHistoryHeartDisease', label: 'Heart Disease', color: '#ef4444' },
                  { name: 'familyHistoryDiabetes', label: 'Diabetes', color: '#f59e0b' },
                  { name: 'familyHistoryStroke', label: 'Stroke', color: '#8b5cf6' },
                  { name: 'familyHistoryCancer', label: 'Cancer', color: '#ec4899' },
                  { name: 'familyHistoryHypertension', label: 'High Blood Pressure', color: '#ef4444' },
                  { name: 'familyHistoryObesity', label: 'Obesity', color: '#f97316' }
                ].map(item => (
                  <label key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: formData[item.name] ? `${item.color}15` : 'var(--bg)', borderRadius: '8px', border: `2px solid ${formData[item.name] ? item.color : 'var(--border-subtle)'}` }}>
                    <input type="checkbox" name={item.name} checked={formData[item.name]} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: item.color }} />
                    {item.label}
                  </label>
                ))}
              </div>
              {formData.familyHistoryHeartDisease && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Age of Family Heart Disease Onset</label>
                  <input type="number" name="familyHeartDiseaseAge" value={formData.familyHeartDiseaseAge} onChange={handleChange} className="form-input" placeholder="55" min="20" max="100" />
                </div>
              )}
              {formData.familyHistoryCancer && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cancer Types in Family</label>
                  <input type="text" name="familyCancerTypes" value={formData.familyCancerTypes} onChange={handleChange} className="form-input" placeholder="e.g., Breast, Colon" />
                </div>
              )}
            </FormSection>

            <FormSection title="Environment & Lifestyle" icon={MapPin} color="#10b981">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Occupation Type</label>
                <select name="occupation" value={formData.occupation} onChange={handleChange} className="form-select">
                  <option value="office">🏢 Office/Desk Work</option>
                  <option value="manual">🔨 Manual Labor</option>
                  <option value="healthcare">🏥 Healthcare</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Air Quality</label>
                <select name="airQualityIndex" value={formData.airQualityIndex} onChange={handleChange} className="form-select">
                  <option value="good">🌿 Good</option>
                  <option value="moderate">🌤️ Moderate</option>
                  <option value="poor">🏭 Poor</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Social Connections</label>
                <select name="socialConnections" value={formData.socialConnections} onChange={handleChange} className="form-select">
                  <option value="low">🙁 Low</option>
                  <option value="moderate">😊 Moderate</option>
                  <option value="high">🥳 High</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="exposureToToxins" checked={formData.exposureToToxins} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  Exposure to Toxins/Chemicals at Work
                </label>
              </div>
            </FormSection>
          </>
        )}

        {/* Navigation & Submit */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'space-between',
          padding: '1.5rem 0',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {activeSection !== 'basic' && (
              <button type="button" onClick={() => {
                const sections = ['basic', 'health', 'lifestyle', 'medical', 'family']
                const currentIdx = sections.indexOf(activeSection)
                if (currentIdx > 0) setActiveSection(sections[currentIdx - 1])
              }} className="btn btn-outline" style={{ padding: '0.75rem 1.25rem' }}>
                ← Previous
              </button>
            )}
            {activeSection !== 'family' && (
              <button type="button" onClick={() => {
                const sections = ['basic', 'health', 'lifestyle', 'medical', 'family']
                const currentIdx = sections.indexOf(activeSection)
                if (currentIdx < sections.length - 1) setActiveSection(sections[currentIdx + 1])
              }} className="btn btn-outline" style={{ padding: '0.75rem 1.25rem' }}>
                Next →
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/patients" className="btn btn-outline" style={{ padding: '0.875rem 1.5rem' }}>Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.875rem 2rem' }}>
              <Save size={18} />
              {loading ? 'Saving...' : isEdit ? 'Update Patient' : 'Create Patient'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PatientForm
