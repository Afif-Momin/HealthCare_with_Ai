import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingUp,
  Heart,
  Activity,
  Brain,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  User,
  Cigarette,
  Dumbbell,
  Utensils,
  Moon,
  Wine,
  Pill,
  Users,
  Stethoscope,
  Scale,
  Thermometer,
  Droplet,
  HeartPulse,
  ShieldAlert,
  Info,
  ChevronRight,
  Calendar,
  MapPin,
  Briefcase
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
  ComposedChart,
  ReferenceLine
} from 'recharts'
import { predictiveTimelineAPI, patientsAPI } from '../services/api'

const PredictiveTimeline = () => {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [timelineData, setTimelineData] = useState(null)
  const [whatIfData, setWhatIfData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [calculatingWhatIf, setCalculatingWhatIf] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileComplete, setProfileComplete] = useState(false)
  const [showInsightsModal, setShowInsightsModal] = useState(false)

  // Comprehensive Health Profile State
  const [healthInputs, setHealthInputs] = useState({
    // Basic Demographics
    age: 30,
    gender: 'male',
    height: 170, // cm
    weight: 70, // kg

    // Vital Signs & Biomarkers
    systolicBP: 120,
    diastolicBP: 80,
    restingHeartRate: 72,
    totalCholesterol: 200,
    ldlCholesterol: 130,
    hdlCholesterol: 50,
    triglycerides: 150,
    fastingGlucose: 95,
    hba1c: 5.5,

    // Lifestyle Factors
    smoker: false,
    smokingYears: 0,
    cigarettesPerDay: 0,
    formerSmoker: false,
    yearsQuitSmoking: 0,

    alcoholConsumption: 'moderate', // none, light, moderate, heavy
    drinksPerWeek: 3,

    exerciseHoursPerWeek: 2,
    exerciseIntensity: 'moderate', // light, moderate, vigorous
    sedentaryHoursPerDay: 8,

    diet: 'average', // poor, average, healthy, mediterranean, keto, vegan
    dailyVegetableServings: 2,
    dailyFruitServings: 1,
    processedFoodFrequency: 'sometimes', // rarely, sometimes, often, daily

    sleepHoursPerNight: 7,
    sleepQuality: 'fair', // poor, fair, good, excellent

    stressLevel: 'moderate', // low, moderate, high, very_high

    // Medical History
    diabetic: false,
    diabetesType: 'none', // none, type1, type2, prediabetes
    onBPMeds: false,
    onCholesterolMeds: false,
    onDiabetesMeds: false,
    otherMedications: '',

    // Family History
    familyHistoryHeartDisease: false,
    familyHeartDiseaseAge: null,
    familyHistoryDiabetes: false,
    familyHistoryStroke: false,
    familyHistoryCancer: false,
    familyCancerTypes: '',
    familyHistoryHypertension: false,
    familyHistoryObesity: false,

    // Additional Risk Factors
    hasChronicKidneyDisease: false,
    hasAutoImmuneDisorder: false,
    hadHeartAttack: false,
    hadStroke: false,
    hasArrhythmia: false,

    // Environment & Occupation
    occupation: 'office', // manual, office, healthcare, other
    exposureToToxins: false,
    airQualityIndex: 'good', // good, moderate, poor

    // Mental Health
    hasAnxiety: false,
    hasDepression: false,
    socialConnections: 'moderate' // low, moderate, high
  })

  // What-If scenario inputs (separate from main inputs)
  const [whatIfInputs, setWhatIfInputs] = useState({
    exerciseHoursPerWeek: 5,
    exerciseIntensity: 'vigorous',
    diet: 'mediterranean',
    smoker: false,
    bmi: 22,
    systolicBP: 115,
    sleepHoursPerNight: 8,
    stressLevel: 'low',
    alcoholConsumption: 'light',
    dailyVegetableServings: 5
  })

  // Calculate BMI from height and weight
  const calculateBMI = () => {
    const heightM = healthInputs.height / 100
    return (healthInputs.weight / (heightM * heightM)).toFixed(1)
  }

  useEffect(() => {
    if (patientId) {
      fetchPatient()
    }
  }, [patientId])

  const fetchPatient = async () => {
    try {
      const response = await patientsAPI.getById(parseInt(patientId))
      const p = response.data
      setPatient(p)

      // Pre-fill all health data from patient profile
      if (p) {
        const birthDate = new Date(p.dateOfBirth)
        const today = new Date()
        const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000))

        // Check if patient has health profile data
        const hasHealthProfile = p.height || p.systolicBP || p.totalCholesterol || p.exerciseHoursPerWeek

        setHealthInputs(prev => ({
          ...prev,
          // Demographics
          age: age || 30,
          gender: p.gender?.toLowerCase() || 'male',
          height: p.height || prev.height,
          weight: p.weight || prev.weight,

          // Vital Signs & Biomarkers
          systolicBP: p.systolicBP || prev.systolicBP,
          diastolicBP: p.diastolicBP || prev.diastolicBP,
          restingHeartRate: p.restingHeartRate || prev.restingHeartRate,
          totalCholesterol: p.totalCholesterol || prev.totalCholesterol,
          ldlCholesterol: p.ldlCholesterol || prev.ldlCholesterol,
          hdlCholesterol: p.hdlCholesterol || prev.hdlCholesterol,
          triglycerides: p.triglycerides || prev.triglycerides,
          fastingGlucose: p.fastingGlucose || prev.fastingGlucose,
          hba1c: p.hba1c || prev.hba1c,

          // Lifestyle - Smoking
          smoker: p.smoker ?? prev.smoker,
          smokingYears: p.smokingYears || prev.smokingYears,
          cigarettesPerDay: p.cigarettesPerDay || prev.cigarettesPerDay,
          formerSmoker: p.formerSmoker ?? prev.formerSmoker,
          yearsQuitSmoking: p.yearsQuitSmoking || prev.yearsQuitSmoking,

          // Lifestyle - Alcohol
          alcoholConsumption: p.alcoholConsumption || prev.alcoholConsumption,
          drinksPerWeek: p.drinksPerWeek || prev.drinksPerWeek,

          // Lifestyle - Exercise
          exerciseHoursPerWeek: p.exerciseHoursPerWeek || prev.exerciseHoursPerWeek,
          exerciseIntensity: p.exerciseIntensity || prev.exerciseIntensity,
          sedentaryHoursPerDay: p.sedentaryHoursPerDay || prev.sedentaryHoursPerDay,

          // Lifestyle - Diet
          diet: p.diet || prev.diet,
          dailyVegetableServings: p.dailyVegetableServings || prev.dailyVegetableServings,
          dailyFruitServings: p.dailyFruitServings || prev.dailyFruitServings,
          processedFoodFrequency: p.processedFoodFrequency || prev.processedFoodFrequency,

          // Lifestyle - Sleep & Stress
          sleepHoursPerNight: p.sleepHoursPerNight || prev.sleepHoursPerNight,
          sleepQuality: p.sleepQuality || prev.sleepQuality,
          stressLevel: p.stressLevel || prev.stressLevel,

          // Medical History
          diabetic: p.diabetic ?? prev.diabetic,
          diabetesType: p.diabetesType || prev.diabetesType,
          onBPMeds: p.onBPMeds ?? prev.onBPMeds,
          onCholesterolMeds: p.onCholesterolMeds ?? prev.onCholesterolMeds,
          onDiabetesMeds: p.onDiabetesMeds ?? prev.onDiabetesMeds,

          // Family History
          familyHistoryHeartDisease: p.familyHistoryHeartDisease ?? prev.familyHistoryHeartDisease,
          familyHistoryDiabetes: p.familyHistoryDiabetes ?? prev.familyHistoryDiabetes,
          familyHistoryStroke: p.familyHistoryStroke ?? prev.familyHistoryStroke,
          familyHistoryCancer: p.familyHistoryCancer ?? prev.familyHistoryCancer,
          familyHistoryHypertension: p.familyHistoryHypertension ?? prev.familyHistoryHypertension,
          familyHistoryObesity: p.familyHistoryObesity ?? prev.familyHistoryObesity,

          // Additional Risk Factors
          hasChronicKidneyDisease: p.hasChronicKidneyDisease ?? prev.hasChronicKidneyDisease,
          hadHeartAttack: p.hadHeartAttack ?? prev.hadHeartAttack,
          hadStroke: p.hadStroke ?? prev.hadStroke,
          hasArrhythmia: p.hasArrhythmia ?? prev.hasArrhythmia,
          hasAnxiety: p.hasAnxiety ?? prev.hasAnxiety,
          hasDepression: p.hasDepression ?? prev.hasDepression,

          // Environment
          occupation: p.occupation || prev.occupation,
          socialConnections: p.socialConnections || prev.socialConnections
        }))

        // If patient has health profile, auto-generate timeline
        if (hasHealthProfile) {
          setProfileComplete(true)
          // Generate timeline automatically with patient data
          setTimeout(() => {
            generateTimelineWithPatientData(p, age)
          }, 100)
        }
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching patient:', err)
      setLoading(false)
    }
  }

  const generateTimelineWithPatientData = async (patientData, age) => {
    try {
      setGenerating(true)
      const p = patientData

      // Calculate BMI from patient data
      let bmi = 25.0
      if (p.height && p.weight) {
        const heightM = p.height / 100
        bmi = parseFloat((p.weight / (heightM * heightM)).toFixed(1))
      }

      const inputsFromPatient = {
        age: age,
        gender: p.gender?.toLowerCase() || 'male',
        height: p.height || 170,
        weight: p.weight || 70,
        bmi: bmi,
        systolicBP: p.systolicBP || 120,
        diastolicBP: p.diastolicBP || 80,
        restingHeartRate: p.restingHeartRate || 72,
        totalCholesterol: p.totalCholesterol || 200,
        ldlCholesterol: p.ldlCholesterol || 130,
        hdlCholesterol: p.hdlCholesterol || 50,
        triglycerides: p.triglycerides || 150,
        fastingGlucose: p.fastingGlucose || 95,
        hba1c: p.hba1c || 5.5,
        smoker: p.smoker || false,
        smokingYears: p.smokingYears || 0,
        cigarettesPerDay: p.cigarettesPerDay || 0,
        formerSmoker: p.formerSmoker || false,
        yearsQuitSmoking: p.yearsQuitSmoking || 0,
        alcoholConsumption: p.alcoholConsumption || 'moderate',
        drinksPerWeek: p.drinksPerWeek || 3,
        exerciseHoursPerWeek: p.exerciseHoursPerWeek || 2,
        exerciseIntensity: p.exerciseIntensity || 'moderate',
        sedentaryHoursPerDay: p.sedentaryHoursPerDay || 8,
        diet: p.diet || 'average',
        dailyVegetableServings: p.dailyVegetableServings || 2,
        dailyFruitServings: p.dailyFruitServings || 1,
        processedFoodFrequency: p.processedFoodFrequency || 'sometimes',
        sleepHoursPerNight: p.sleepHoursPerNight || 7,
        sleepQuality: p.sleepQuality || 'fair',
        stressLevel: p.stressLevel || 'moderate',
        diabetic: p.diabetic || false,
        diabetesType: p.diabetesType || 'none',
        onBPMeds: p.onBPMeds || false,
        onCholesterolMeds: p.onCholesterolMeds || false,
        onDiabetesMeds: p.onDiabetesMeds || false,
        familyHistoryHeartDisease: p.familyHistoryHeartDisease || false,
        familyHistoryDiabetes: p.familyHistoryDiabetes || false,
        familyHistoryStroke: p.familyHistoryStroke || false,
        familyHistoryCancer: p.familyHistoryCancer || false,
        familyHistoryHypertension: p.familyHistoryHypertension || false,
        familyHistoryObesity: p.familyHistoryObesity || false,
        hasChronicKidneyDisease: p.hasChronicKidneyDisease || false,
        hadHeartAttack: p.hadHeartAttack || false,
        hadStroke: p.hadStroke || false,
        hasArrhythmia: p.hasArrhythmia || false,
        hasAnxiety: p.hasAnxiety || false,
        hasDepression: p.hasDepression || false
      }

      const response = await predictiveTimelineAPI.generate(parseInt(patientId), inputsFromPatient)
      setTimelineData(response.data)
      setActiveTab('trajectory')
    } catch (err) {
      console.error('Error generating timeline:', err)
    } finally {
      setGenerating(false)
    }
  }

  const generateTimeline = async () => {
    try {
      setGenerating(true)
      const bmi = parseFloat(calculateBMI())

      const completeInputs = {
        ...healthInputs,
        bmi: bmi,
        // Ensure all boolean values are properly passed
        smoker: healthInputs.smoker || healthInputs.cigarettesPerDay > 0,
        diabetic: healthInputs.diabetic || healthInputs.diabetesType !== 'none'
      }

      const response = await predictiveTimelineAPI.generate(parseInt(patientId), completeInputs)
      setTimelineData(response.data)
      setProfileComplete(true)
      setActiveTab('trajectory')
    } catch (err) {
      console.error('Error generating timeline:', err)
      setError('Failed to generate timeline')
    } finally {
      setGenerating(false)
    }
  }

  const regenerateTimeline = async () => {
    await generateTimeline()
  }

  const handleInputChange = (key, value) => {
    setHealthInputs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleWhatIfChange = (key, value) => {
    setWhatIfInputs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const calculateWhatIf = async () => {
    try {
      setCalculatingWhatIf(true)
      const response = await predictiveTimelineAPI.whatIf(parseInt(patientId), {
        ...whatIfInputs,
        baselineSystolicBP: healthInputs.systolicBP,
        baselineTotalCholesterol: healthInputs.totalCholesterol,
        baselineHDLCholesterol: healthInputs.hdlCholesterol,
        baselineSmoker: healthInputs.smoker,
        baselineDiabetic: healthInputs.diabetic,
        baselineOnBPMeds: healthInputs.onBPMeds,
        baselineExerciseHoursPerWeek: healthInputs.exerciseHoursPerWeek,
        baselineDiet: healthInputs.diet,
        baselineBMI: healthInputs.bmi
      })
      setWhatIfData(response.data)
    } catch (err) {
      console.error('Error calculating what-if:', err)
    } finally {
      setCalculatingWhatIf(false)
    }
  }

  // Custom tooltip for trajectory chart
  const TrajectoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
            Age {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.875rem' }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Get risk level color
  const getRiskColor = (risk) => {
    if (!risk || risk < 10) return '#10b981'
    if (risk < 20) return '#f59e0b'
    if (risk < 30) return '#f97316'
    return '#ef4444'
  }

  // Get health score color
  const getHealthScoreColor = (score) => {
    if (!score || score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }

  // Get risk level text
  const getRiskLevel = (risk) => {
    if (!risk || risk < 5) return 'Very Low'
    if (risk < 10) return 'Low'
    if (risk < 20) return 'Moderate'
    if (risk < 30) return 'High'
    return 'Very High'
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 2s infinite'
        }}>
          <TrendingUp size={40} color="white" />
        </div>
        <p style={{ color: 'var(--text-light)', fontSize: '1.125rem' }}>
          Loading patient data...
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
      </div>
    )
  }

  // Helper function to parse AI insights into readable format
  const parseAIInsights = (insights) => {
    if (!insights) return null

    try {
      // Try to extract JSON from markdown code block
      let jsonStr = insights
      if (insights.includes('```json')) {
        jsonStr = insights.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      }

      const parsed = JSON.parse(jsonStr)
      return parsed
    } catch (e) {
      // If not JSON, return as plain text
      return { plainText: insights }
    }
  }

  // Render AI insights in a beautiful, readable format
  const renderAIInsights = (insights) => {
    const parsed = parseAIInsights(insights)

    if (!parsed) return <p>No insights available</p>

    if (parsed.plainText) {
      return <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{parsed.plainText}</p>
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Primary Summary */}
        {parsed.primaryClinicalSummary && (
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Stethoscope size={18} />
              Clinical Summary
            </h4>
            <p style={{ margin: 0, lineHeight: '1.7', color: '#1e3a5f' }}>{parsed.primaryClinicalSummary}</p>
          </div>
        )}

        {/* Risk Assessment */}
        {parsed.riskAssessment && (
          <div style={{
            background: parsed.riskAssessment.overallRiskLevel === 'Low'
              ? 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)'
              : parsed.riskAssessment.overallRiskLevel === 'Moderate'
                ? 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)'
                : 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: `4px solid ${parsed.riskAssessment.overallRiskLevel === 'Low' ? '#10b981' :
              parsed.riskAssessment.overallRiskLevel === 'Moderate' ? '#f59e0b' : '#ef4444'
              }`
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: parsed.riskAssessment.overallRiskLevel === 'Low' ? '#166534' : parsed.riskAssessment.overallRiskLevel === 'Moderate' ? '#92400e' : '#991b1b' }}>
              <ShieldAlert size={18} />
              Risk Assessment
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: parsed.riskAssessment.overallRiskLevel === 'Low' ? '#166534' : parsed.riskAssessment.overallRiskLevel === 'Moderate' ? '#92400e' : '#991b1b' }}>{parsed.riskAssessment.overallRiskLevel}</div>
                <div style={{ fontSize: '0.75rem', color: parsed.riskAssessment.overallRiskLevel === 'Low' ? '#15803d' : parsed.riskAssessment.overallRiskLevel === 'Moderate' ? '#a16207' : '#b91c1c' }}>Overall Risk</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: parsed.riskAssessment.overallRiskLevel === 'Low' ? '#166534' : parsed.riskAssessment.overallRiskLevel === 'Moderate' ? '#92400e' : '#991b1b' }}>{parsed.riskAssessment.riskOfProgression}%</div>
                <div style={{ fontSize: '0.75rem', color: parsed.riskAssessment.overallRiskLevel === 'Low' ? '#15803d' : parsed.riskAssessment.overallRiskLevel === 'Moderate' ? '#a16207' : '#b91c1c' }}>Progression Risk</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: parsed.riskAssessment.overallRiskLevel === 'Low' ? '#166534' : parsed.riskAssessment.overallRiskLevel === 'Moderate' ? '#92400e' : '#991b1b' }}>{parsed.riskAssessment.confidenceScore}%</div>
                <div style={{ fontSize: '0.75rem', color: parsed.riskAssessment.overallRiskLevel === 'Low' ? '#15803d' : parsed.riskAssessment.overallRiskLevel === 'Moderate' ? '#a16207' : '#b91c1c' }}>Confidence</div>
              </div>
            </div>
            {parsed.riskAssessment.riskFactors && (
              <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: '1.6', color: parsed.riskAssessment.overallRiskLevel === 'Low' ? '#166534' : parsed.riskAssessment.overallRiskLevel === 'Moderate' ? '#78350f' : '#7f1d1d' }}>{parsed.riskAssessment.riskFactors}</p>
            )}
          </div>
        )}

        {/* Key Indicators */}
        {parsed.keyIndicators && parsed.keyIndicators.length > 0 && (
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
              <Activity size={18} color="#6366f1" />
              Key Health Indicators
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8', color: '#374151' }}>
              {parsed.keyIndicators.filter(i => i && !i.includes('not provided')).map((indicator, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{indicator}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {parsed.recommendations && (
          <div style={{
            background: 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: '4px solid #9333ea'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} />
              Personalized Recommendations
            </h4>

            {parsed.recommendations.immediateActions && (
              <div style={{ marginBottom: '1rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', color: '#6b21a8' }}>
                  🎯 Immediate Actions
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', color: '#581c87' }}>
                  {parsed.recommendations.immediateActions.map((action, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsed.recommendations.monitoringAndFollowUp && (
              <div>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', color: '#6b21a8' }}>
                  📋 Monitoring & Follow-Up
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', color: '#581c87' }}>
                  {parsed.recommendations.monitoringAndFollowUp.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Warning Signs */}
        {parsed.warningSigns && parsed.warningSigns.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: '4px solid #ef4444'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} />
              Warning Signs to Watch For
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7', color: '#991b1b' }}>
              {parsed.warningSigns.map((sign, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{sign}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        {parsed.finalAINote && (
          <div style={{
            background: '#f1f5f9',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            color: '#64748b',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            {parsed.finalAINote}
          </div>
        )}
      </div>
    )
  }

  const riskScores = timelineData?.riskScores || {}
  const currentTrajectory = timelineData?.currentTrajectory || []
  const improvedTrajectory = timelineData?.improvedTrajectory || []
  const interventionImpacts = timelineData?.interventionImpacts || []
  const aiInsights = timelineData?.aiInsights || ''
  const diseaseOnsetProbabilities = timelineData?.diseaseOnsetProbabilities || []

  // Prepare combined trajectory data for chart
  const combinedTrajectoryData = currentTrajectory.map((current, index) => ({
    age: current.age,
    currentHealth: current.healthScore,
    improvedHealth: improvedTrajectory[index]?.healthScore || current.healthScore,
    currentHeartRisk: current.heartDiseaseRisk,
    improvedHeartRisk: improvedTrajectory[index]?.heartDiseaseRisk || current.heartDiseaseRisk
  }))

  // Radar chart data for risk overview
  const radarData = [
    { subject: 'Heart', current: riskScores.framingham10Year, improved: riskScores.framingham10Year * 0.6, fullMark: 50 },
    { subject: 'Diabetes', current: riskScores.diabetes, improved: riskScores.diabetes * 0.6, fullMark: 50 },
    { subject: 'Stroke', current: riskScores.stroke, improved: riskScores.stroke * 0.6, fullMark: 50 },
    { subject: 'Cancer', current: riskScores.cancer, improved: riskScores.cancer * 0.6, fullMark: 50 }
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Back Link */}
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        color: 'white',
        padding: '2.5rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={32} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
                Predictive Health Timeline
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '1.125rem' }}>
                {patient?.firstName} {patient?.lastName} {timelineData?.currentAge ? `• Age ${timelineData?.currentAge}` : ''}
              </p>
            </div>
          </div>

          <p style={{ margin: 0, opacity: 0.85, maxWidth: '600px' }}>
            Your personalized health trajectory based on Framingham risk calculations
            and AI-powered predictions. See how lifestyle changes can impact your future.
          </p>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>

      {/* Health Score Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Overall Health Score */}
        <div className="card" style={{
          background: `linear-gradient(135deg, ${getHealthScoreColor(riskScores.overallHealthScore)}15 0%, white 100%)`,
          border: `2px solid ${getHealthScoreColor(riskScores.overallHealthScore)}40`,
          textAlign: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getHealthScoreColor(riskScores.overallHealthScore)} 0%, ${getHealthScoreColor(riskScores.overallHealthScore)}80 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: `0 8px 20px ${getHealthScoreColor(riskScores.overallHealthScore)}40`
          }}>
            <span style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800' }}>
              {riskScores.overallHealthScore}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Health Score</h3>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-light)', fontSize: '0.875rem' }}>
            Overall wellness index
          </p>
        </div>

        {/* Heart Disease Risk */}
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <Heart size={32} color={getRiskColor(riskScores.framingham10Year)} style={{ marginBottom: '0.5rem' }} />
          <div style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: getRiskColor(riskScores.framingham10Year || 0)
          }}>
            {(riskScores.framingham10Year || 0).toFixed(1)}%
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', fontWeight: '600' }}>Heart Disease</h3>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-light)', fontSize: '0.75rem' }}>
            10-year risk (Framingham)
          </p>
        </div>

        {/* Diabetes Risk */}
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <Activity size={32} color={getRiskColor(riskScores.diabetes)} style={{ marginBottom: '0.5rem' }} />
          <div style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: getRiskColor(riskScores.diabetes || 0)
          }}>
            {(riskScores.diabetes || 0).toFixed(1)}%
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', fontWeight: '600' }}>Diabetes</h3>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-light)', fontSize: '0.75rem' }}>
            10-year risk
          </p>
        </div>

        {/* Stroke Risk */}
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <Brain size={32} color={getRiskColor(riskScores.stroke)} style={{ marginBottom: '0.5rem' }} />
          <div style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: getRiskColor(riskScores.stroke || 0)
          }}>
            {(riskScores.stroke || 0).toFixed(1)}%
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', fontWeight: '600' }}>Stroke</h3>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-light)', fontSize: '0.75rem' }}>
            10-year risk
          </p>
        </div>

        {/* Cancer Risk */}
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <Target size={32} color={getRiskColor(riskScores.cancer)} style={{ marginBottom: '0.5rem' }} />
          <div style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: getRiskColor(riskScores.cancer || 0)
          }}>
            {(riskScores.cancer || 0).toFixed(1)}%
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', fontWeight: '600' }}>Cancer</h3>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-light)', fontSize: '0.75rem' }}>
            10-year risk
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        background: 'var(--bg)',
        padding: '0.5rem',
        borderRadius: '12px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'profile', label: 'Health Profile', icon: User, required: !profileComplete },
          { id: 'trajectory', label: 'Trajectory', icon: TrendingUp, disabled: !profileComplete },
          { id: 'whatif', label: 'What-If', icon: Sparkles, disabled: !profileComplete },
          { id: 'insights', label: 'AI Insights', icon: Brain, disabled: !profileComplete },
          { id: 'interventions', label: 'Interventions', icon: Zap, disabled: !profileComplete }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            style={{
              flex: '1 1 auto',
              minWidth: '120px',
              padding: '0.875rem 1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              opacity: tab.disabled ? 0.5 : 1,
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : tab.required
                  ? 'linear-gradient(135deg, #f59e0b20 0%, #d9770620 100%)'
                  : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text)',
              position: 'relative'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.required && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '10px',
                height: '10px',
                background: '#f59e0b',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Profile Tab - Comprehensive Health Data Collection */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Introduction */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '2px solid #fde68a',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <Info size={24} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>Complete Your Health Profile</h3>
              <p style={{ margin: 0, color: '#78350f', lineHeight: '1.6' }}>
                For the most accurate health predictions, please provide detailed information below.
                The more data you provide, the better our AI can analyze your health trajectory and
                recommend personalized interventions. All fields help us calculate your risks using
                medical-grade formulas like the Framingham Risk Score.
              </p>
            </div>
          </div>

          {/* Demographics & Body Measurements */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <User size={24} color="#667eea" />
              Demographics & Body Measurements
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {/* Age */}
              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Calendar size={16} color="#667eea" />
                  Age *
                </label>
                <input
                  type="number"
                  value={healthInputs.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="1"
                  max="120"
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <User size={16} color="#667eea" />
                  Biological Sex *
                </label>
                <select
                  value={healthInputs.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Height */}
              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Scale size={16} color="#667eea" />
                  Height (cm) *
                </label>
                <input
                  type="number"
                  value={healthInputs.height}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="100"
                  max="250"
                />
              </div>

              {/* Weight */}
              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Scale size={16} color="#667eea" />
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  value={healthInputs.weight}
                  onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="30"
                  max="300"
                />
              </div>

              {/* Calculated BMI Display */}
              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Target size={16} color="#667eea" />
                  Calculated BMI
                </label>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: parseFloat(calculateBMI()) < 18.5 ? '#fef3c7' :
                    parseFloat(calculateBMI()) < 25 ? '#dcfce7' :
                      parseFloat(calculateBMI()) < 30 ? '#fef3c7' : '#fee2e2',
                  border: '2px solid transparent',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  color: parseFloat(calculateBMI()) < 18.5 ? '#92400e' :
                    parseFloat(calculateBMI()) < 25 ? '#166534' :
                      parseFloat(calculateBMI()) < 30 ? '#92400e' : '#991b1b'
                }}>
                  {calculateBMI()}
                  <span style={{ fontSize: '0.75rem', fontWeight: '400', marginLeft: '0.5rem' }}>
                    ({parseFloat(calculateBMI()) < 18.5 ? 'Underweight' :
                      parseFloat(calculateBMI()) < 25 ? 'Normal' :
                        parseFloat(calculateBMI()) < 30 ? 'Overweight' : 'Obese'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vital Signs & Biomarkers */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <HeartPulse size={24} color="#ef4444" />
              Vital Signs & Blood Work
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {/* Blood Pressure */}
              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Heart size={16} color="#ef4444" />
                  Systolic BP (mmHg) *
                </label>
                <input
                  type="number"
                  value={healthInputs.systolicBP}
                  onChange={(e) => handleInputChange('systolicBP', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `2px solid ${healthInputs.systolicBP > 140 ? '#ef4444' : healthInputs.systolicBP > 120 ? '#f59e0b' : '#10b981'}`,
                    fontSize: '1rem'
                  }}
                  min="80"
                  max="250"
                />
                <small style={{ color: 'var(--text-light)' }}>Normal: &lt;120 | Elevated: 120-129 | High: 130+</small>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Heart size={16} color="#ef4444" />
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={healthInputs.diastolicBP}
                  onChange={(e) => handleInputChange('diastolicBP', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="40"
                  max="150"
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Activity size={16} color="#ef4444" />
                  Resting Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={healthInputs.restingHeartRate}
                  onChange={(e) => handleInputChange('restingHeartRate', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="40"
                  max="200"
                />
              </div>

              {/* Cholesterol Panel */}
              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Droplet size={16} color="#f59e0b" />
                  Total Cholesterol (mg/dL) *
                </label>
                <input
                  type="number"
                  value={healthInputs.totalCholesterol}
                  onChange={(e) => handleInputChange('totalCholesterol', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="100"
                  max="400"
                />
                <small style={{ color: 'var(--text-light)' }}>Desirable: &lt;200 | Borderline: 200-239 | High: 240+</small>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Droplet size={16} color="#10b981" />
                  HDL Cholesterol (mg/dL) *
                </label>
                <input
                  type="number"
                  value={healthInputs.hdlCholesterol}
                  onChange={(e) => handleInputChange('hdlCholesterol', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `2px solid ${healthInputs.hdlCholesterol >= 60 ? '#10b981' : healthInputs.hdlCholesterol >= 40 ? '#f59e0b' : '#ef4444'}`,
                    fontSize: '1rem'
                  }}
                  min="20"
                  max="120"
                />
                <small style={{ color: 'var(--text-light)' }}>Higher is better: ≥60 is protective</small>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Droplet size={16} color="#ef4444" />
                  LDL Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  value={healthInputs.ldlCholesterol}
                  onChange={(e) => handleInputChange('ldlCholesterol', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="40"
                  max="300"
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Droplet size={16} color="#8b5cf6" />
                  Triglycerides (mg/dL)
                </label>
                <input
                  type="number"
                  value={healthInputs.triglycerides}
                  onChange={(e) => handleInputChange('triglycerides', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="50"
                  max="500"
                />
              </div>

              {/* Blood Sugar */}
              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Thermometer size={16} color="#f59e0b" />
                  Fasting Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  value={healthInputs.fastingGlucose}
                  onChange={(e) => handleInputChange('fastingGlucose', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `2px solid ${healthInputs.fastingGlucose > 125 ? '#ef4444' : healthInputs.fastingGlucose > 99 ? '#f59e0b' : '#10b981'}`,
                    fontSize: '1rem'
                  }}
                  min="50"
                  max="400"
                />
                <small style={{ color: 'var(--text-light)' }}>Normal: &lt;100 | Prediabetes: 100-125 | Diabetes: 126+</small>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Thermometer size={16} color="#f59e0b" />
                  HbA1c (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={healthInputs.hba1c}
                  onChange={(e) => handleInputChange('hba1c', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="4"
                  max="15"
                />
                <small style={{ color: 'var(--text-light)' }}>Normal: &lt;5.7% | Prediabetes: 5.7-6.4% | Diabetes: 6.5%+</small>
              </div>
            </div>
          </div>

          {/* Lifestyle Factors */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Dumbbell size={24} color="#10b981" />
              Lifestyle Factors
            </h2>

            {/* Smoking Section */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
                <Cigarette size={20} color="#ef4444" />
                Smoking Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: healthInputs.smoker ? '#fee2e2' : 'white',
                  border: `2px solid ${healthInputs.smoker ? '#fecaca' : '#e5e7eb'}`
                }}>
                  <input
                    type="checkbox"
                    checked={healthInputs.smoker}
                    onChange={(e) => handleInputChange('smoker', e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontWeight: '600' }}>Currently Smoking</span>
                </label>

                {healthInputs.smoker && (
                  <>
                    <div className="form-group">
                      <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Cigarettes/Day</label>
                      <input
                        type="number"
                        value={healthInputs.cigarettesPerDay}
                        onChange={(e) => handleInputChange('cigarettesPerDay', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Years Smoking</label>
                      <input
                        type="number"
                        value={healthInputs.smokingYears}
                        onChange={(e) => handleInputChange('smokingYears', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                      />
                    </div>
                  </>
                )}

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: healthInputs.formerSmoker ? '#fef3c7' : 'white',
                  border: `2px solid ${healthInputs.formerSmoker ? '#fde68a' : '#e5e7eb'}`
                }}>
                  <input
                    type="checkbox"
                    checked={healthInputs.formerSmoker}
                    onChange={(e) => handleInputChange('formerSmoker', e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontWeight: '600' }}>Former Smoker</span>
                </label>
              </div>
            </div>

            {/* Exercise Section */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534' }}>
                <Dumbbell size={20} color="#10b981" />
                Physical Activity
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Exercise Hours/Week *</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={healthInputs.exerciseHoursPerWeek}
                    onChange={(e) => handleInputChange('exerciseHoursPerWeek', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                    <span>0</span>
                    <span style={{ color: '#10b981', fontSize: '1.25rem' }}>{healthInputs.exerciseHoursPerWeek}h</span>
                    <span>20</span>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Exercise Intensity</label>
                  <select
                    value={healthInputs.exerciseIntensity}
                    onChange={(e) => handleInputChange('exerciseIntensity', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="light">🚶 Light (walking, stretching)</option>
                    <option value="moderate">🏃 Moderate (jogging, cycling)</option>
                    <option value="vigorous">💪 Vigorous (running, HIIT)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Sedentary Hours/Day</label>
                  <input
                    type="number"
                    value={healthInputs.sedentaryHoursPerDay}
                    onChange={(e) => handleInputChange('sedentaryHoursPerDay', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                    min="0"
                    max="24"
                  />
                </div>
              </div>
            </div>

            {/* Diet Section */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fef3c7', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e' }}>
                <Utensils size={20} color="#f59e0b" />
                Diet & Nutrition
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Diet Type *</label>
                  <select
                    value={healthInputs.diet}
                    onChange={(e) => handleInputChange('diet', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="poor">🍔 Poor (fast food, processed)</option>
                    <option value="average">🍕 Average (mixed)</option>
                    <option value="healthy">🥗 Healthy (balanced)</option>
                    <option value="mediterranean">🫒 Mediterranean</option>
                    <option value="keto">🥓 Keto/Low-carb</option>
                    <option value="vegan">🥬 Vegan/Plant-based</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Vegetable Servings/Day</label>
                  <input
                    type="number"
                    value={healthInputs.dailyVegetableServings}
                    onChange={(e) => handleInputChange('dailyVegetableServings', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                    min="0"
                    max="15"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Fruit Servings/Day</label>
                  <input
                    type="number"
                    value={healthInputs.dailyFruitServings}
                    onChange={(e) => handleInputChange('dailyFruitServings', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                    min="0"
                    max="15"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Processed Food Frequency</label>
                  <select
                    value={healthInputs.processedFoodFrequency}
                    onChange={(e) => handleInputChange('processedFoodFrequency', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="rarely">🌟 Rarely</option>
                    <option value="sometimes">⚡ Sometimes</option>
                    <option value="often">⚠️ Often</option>
                    <option value="daily">🚨 Daily</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Alcohol & Sleep */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', background: '#faf5ff', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b21a8' }}>
                  <Wine size={20} color="#9333ea" />
                  Alcohol Consumption
                </h3>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Consumption Level</label>
                  <select
                    value={healthInputs.alcoholConsumption}
                    onChange={(e) => handleInputChange('alcoholConsumption', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="none">🚫 None</option>
                    <option value="light">🍷 Light (1-3/week)</option>
                    <option value="moderate">🍺 Moderate (4-7/week)</option>
                    <option value="heavy">🍻 Heavy (8+/week)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Drinks Per Week</label>
                  <input
                    type="number"
                    value={healthInputs.drinksPerWeek}
                    onChange={(e) => handleInputChange('drinksPerWeek', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                    min="0"
                    max="50"
                  />
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af' }}>
                  <Moon size={20} color="#3b82f6" />
                  Sleep & Stress
                </h3>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Sleep Hours/Night</label>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={healthInputs.sleepHoursPerNight}
                    onChange={(e) => handleInputChange('sleepHoursPerNight', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                    <span>3h</span>
                    <span style={{ color: healthInputs.sleepHoursPerNight >= 7 && healthInputs.sleepHoursPerNight <= 9 ? '#10b981' : '#f59e0b' }}>
                      {healthInputs.sleepHoursPerNight}h
                    </span>
                    <span>12h</span>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Sleep Quality</label>
                  <select
                    value={healthInputs.sleepQuality}
                    onChange={(e) => handleInputChange('sleepQuality', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="poor">😴 Poor</option>
                    <option value="fair">😐 Fair</option>
                    <option value="good">😊 Good</option>
                    <option value="excellent">🌟 Excellent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Stress Level</label>
                  <select
                    value={healthInputs.stressLevel}
                    onChange={(e) => handleInputChange('stressLevel', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="low">😌 Low</option>
                    <option value="moderate">😐 Moderate</option>
                    <option value="high">😰 High</option>
                    <option value="very_high">😫 Very High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Family History */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Users size={24} color="#8b5cf6" />
              Family Medical History
            </h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              Family history significantly impacts your risk calculations. Check all that apply to first-degree relatives (parents, siblings).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { key: 'familyHistoryHeartDisease', label: 'Heart Disease', icon: Heart, color: '#ef4444' },
                { key: 'familyHistoryDiabetes', label: 'Diabetes', icon: Activity, color: '#f59e0b' },
                { key: 'familyHistoryStroke', label: 'Stroke', icon: Brain, color: '#8b5cf6' },
                { key: 'familyHistoryCancer', label: 'Cancer', icon: Target, color: '#ec4899' },
                { key: 'familyHistoryHypertension', label: 'High Blood Pressure', icon: HeartPulse, color: '#ef4444' },
                { key: 'familyHistoryObesity', label: 'Obesity', icon: Scale, color: '#f97316' }
              ].map(item => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: healthInputs[item.key] ? `${item.color}15` : 'white',
                    border: `2px solid ${healthInputs[item.key] ? item.color : '#e5e7eb'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={healthInputs[item.key]}
                    onChange={(e) => handleInputChange(item.key, e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: item.color }}
                  />
                  <item.icon size={20} color={item.color} />
                  <span style={{ fontWeight: '600' }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Medical History */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Pill size={24} color="#10b981" />
              Current Medical Conditions & Medications
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Conditions */}
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Current Conditions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { key: 'diabetic', label: 'Diabetes' },
                    { key: 'hasChronicKidneyDisease', label: 'Chronic Kidney Disease' },
                    { key: 'hasAutoImmuneDisorder', label: 'Autoimmune Disorder' },
                    { key: 'hasArrhythmia', label: 'Heart Arrhythmia' },
                    { key: 'hasAnxiety', label: 'Anxiety' },
                    { key: 'hasDepression', label: 'Depression' }
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={healthInputs[item.key]}
                        onChange={(e) => handleInputChange(item.key, e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ color: '#374151' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Past Events */}
              <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#991b1b' }}>Past Medical Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={healthInputs.hadHeartAttack}
                      onChange={(e) => handleInputChange('hadHeartAttack', e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ color: '#7f1d1d' }}>Previous Heart Attack</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={healthInputs.hadStroke}
                      onChange={(e) => handleInputChange('hadStroke', e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ color: '#7f1d1d' }}>Previous Stroke</span>
                  </label>
                </div>
              </div>

              {/* Medications */}
              <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#166534' }}>Current Medications</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { key: 'onBPMeds', label: 'Blood Pressure Medication' },
                    { key: 'onCholesterolMeds', label: 'Cholesterol Medication (Statins)' },
                    { key: 'onDiabetesMeds', label: 'Diabetes Medication' }
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={healthInputs[item.key]}
                        onChange={(e) => handleInputChange(item.key, e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ color: '#166534' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateTimeline}
            disabled={generating}
            style={{
              width: '100%',
              padding: '1.5rem 2rem',
              background: generating
                ? '#9ca3af'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.25rem',
              fontWeight: '700',
              cursor: generating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => !generating && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {generating ? (
              <>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing Your Health Data...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Generate My Health Prediction
                <ChevronRight size={24} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'trajectory' && timelineData && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Main Trajectory Chart - Branching Timeline */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={24} color="#667eea" />
              Your Health Trajectory: Two Possible Futures
            </h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              <span style={{ color: '#ef4444', fontWeight: '700' }}>🔴 Red Path</span>: Current lifestyle continues |
              <span style={{ color: '#10b981', fontWeight: '700', marginLeft: '0.5rem' }}>🟢 Green Path</span>: With recommended improvements
            </p>
            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart data={combinedTrajectoryData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorImproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="age"
                  stroke="#6b7280"
                  tickFormatter={(value) => `Age ${value}`}
                  label={{ value: 'Your Age', position: 'bottom', offset: 0 }}
                />
                <YAxis
                  stroke="#6b7280"
                  domain={[50, 100]}
                  tickFormatter={(value) => `${value}%`}
                  label={{ value: 'Health Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<TrajectoryTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Good Health Threshold', fill: '#f59e0b', fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="improvedHealth"
                  name="🟢 With Improvements"
                  stroke="#10b981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorImproved)"
                  animationDuration={2000}
                />
                <Area
                  type="monotone"
                  dataKey="currentHealth"
                  name="🔴 Current Path"
                  stroke="#ef4444"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorCurrent)"
                  animationDuration={2000}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Key Insight from Chart */}
            <div style={{
              marginTop: '1rem',
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
              borderRadius: '12px',
              borderLeft: '4px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#166534'
            }}>
              <Sparkles size={24} color="#10b981" />
              <div>
                <strong style={{ color: '#14532d' }}>Key Insight:</strong> By following the improved path, you could maintain a health score above
                {' '}<span style={{ color: '#059669', fontWeight: '700' }}>
                  {improvedTrajectory[improvedTrajectory.length - 1]?.healthScore || 90}%
                </span>{' '}
                at age {improvedTrajectory[improvedTrajectory.length - 1]?.age || 70}, compared to
                {' '}<span style={{ color: '#dc2626', fontWeight: '700' }}>
                  {currentTrajectory[currentTrajectory.length - 1]?.healthScore || 80}%
                </span>{' '}
                on your current path.
              </div>
            </div>
          </div>

          {/* Disease Onset Probabilities */}
          {diseaseOnsetProbabilities && diseaseOnsetProbabilities.length > 0 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <AlertTriangle size={24} color="#f59e0b" />
                Disease Onset Probabilities by Age
              </h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                Estimated probability of developing each condition at different ages based on your current health profile
              </p>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={diseaseOnsetProbabilities} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="age" stroke="#6b7280" tickFormatter={(value) => `Age ${value}`} />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}%`} domain={[0, 'auto']} />
                  <Tooltip
                    formatter={(value) => [`${(value || 0).toFixed(1)}%`]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="heartDisease" name="Heart Disease" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="diabetes" name="Diabetes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stroke" name="Stroke" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancer" name="Cancer" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Risk Radar Chart & Quick Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Target size={20} color="#667eea" />
                Risk Comparison: Current vs Improved
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" stroke="#6b7280" tick={{ fontSize: 14, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 50]} stroke="#6b7280" />
                  <Radar
                    name="Current Risk"
                    dataKey="current"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Radar
                    name="With Improvements"
                    dataKey="improved"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Life Expectancy Comparison */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Clock size={20} color="#10b981" />
                Life Expectancy Projection
              </h3>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem' }}>Current Path</div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: '#ef4444' }}>
                    {currentTrajectory[currentTrajectory.length - 1]?.estimatedLifeExpectancy?.toFixed(1) || '78'} years
                  </div>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem' }}>With Improvements</div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: '#10b981' }}>
                    {improvedTrajectory[improvedTrajectory.length - 1]?.estimatedLifeExpectancy?.toFixed(1) || '85'} years
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                    +{((improvedTrajectory[improvedTrajectory.length - 1]?.estimatedLifeExpectancy || 85) -
                      (currentTrajectory[currentTrajectory.length - 1]?.estimatedLifeExpectancy || 78)).toFixed(1)} years
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#3b82f6' }}>Potential Life Years Gained</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && timelineData && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#1f2937' }}>
            <Brain size={24} color="#8b5cf6" />
            AI-Powered Health Analysis
          </h2>
          <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
            Our AI has analyzed your complete health profile using medical literature and risk models.
            Here are personalized insights and recommendations.
          </p>

          {renderAIInsights(aiInsights)}
        </div>
      )}

      {activeTab === 'whatif' && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* What-If Controls */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Sparkles size={24} color="#f59e0b" />
              What-If Scenario Builder
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              Explore how lifestyle changes could transform your health trajectory
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              {/* Exercise Slider */}
              <div style={{
                background: 'linear-gradient(135deg, #dcfce7 0%, white 100%)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #bbf7d0'
              }}>
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#166534' }}>
                  <Activity size={18} color="#10b981" />
                  Exercise (hours/week)
                </label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={whatIfInputs.exerciseHoursPerWeek}
                  onChange={(e) => handleWhatIfChange('exerciseHoursPerWeek', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  <span style={{ color: '#6b7280' }}>0</span>
                  <span style={{ fontWeight: '700', color: '#10b981', fontSize: '1.25rem' }}>
                    {whatIfInputs.exerciseHoursPerWeek}h
                  </span>
                  <span style={{ color: '#6b7280' }}>15</span>
                </div>
              </div>

              {/* BMI Slider */}
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, white 100%)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}>
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#1e40af' }}>
                  <Target size={18} color="#3b82f6" />
                  Target BMI
                </label>
                <input
                  type="range"
                  min="18"
                  max="35"
                  step="0.5"
                  value={whatIfInputs.bmi}
                  onChange={(e) => handleWhatIfChange('bmi', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  <span style={{ color: '#6b7280' }}>18</span>
                  <span style={{ fontWeight: '700', color: '#3b82f6', fontSize: '1.25rem' }}>
                    {(whatIfInputs.bmi || 25).toFixed(1)}
                  </span>
                  <span style={{ color: '#6b7280' }}>35</span>
                </div>
              </div>

              {/* Blood Pressure Slider */}
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, white 100%)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #fde68a'
              }}>
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#92400e' }}>
                  <Heart size={18} color="#f59e0b" />
                  Systolic BP (mmHg)
                </label>
                <input
                  type="range"
                  min="90"
                  max="180"
                  value={whatIfInputs.systolicBP}
                  onChange={(e) => handleWhatIfChange('systolicBP', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  <span style={{ color: '#6b7280' }}>90</span>
                  <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '1.25rem' }}>
                    {whatIfInputs.systolicBP}
                  </span>
                  <span style={{ color: '#6b7280' }}>180</span>
                </div>
              </div>

              {/* Diet Selection */}
              <div style={{
                background: 'linear-gradient(135deg, #f3e8ff 0%, white 100%)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e9d5ff'
              }}>
                <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#6b21a8' }}>
                  <Zap size={18} color="#9333ea" />
                  Diet Quality
                </label>
                <select
                  value={whatIfInputs.diet}
                  onChange={(e) => handleWhatIfChange('diet', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e9d5ff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#9333ea',
                    background: 'white'
                  }}
                >
                  <option value="poor">🍔 Poor</option>
                  <option value="average">🍕 Average</option>
                  <option value="healthy">🥗 Healthy</option>
                  <option value="mediterranean">🫒 Mediterranean</option>
                </select>
              </div>
            </div>

            {/* Smoking Toggle */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                background: whatIfInputs.smoker ? '#fee2e2' : '#dcfce7',
                border: `2px solid ${whatIfInputs.smoker ? '#fecaca' : '#bbf7d0'}`,
                transition: 'all 0.3s'
              }}>
                <input
                  type="checkbox"
                  checked={whatIfInputs.smoker}
                  onChange={(e) => handleWhatIfChange('smoker', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ fontWeight: '600', fontSize: '1rem', color: whatIfInputs.smoker ? '#7f1d1d' : '#166534' }}>
                  {whatIfInputs.smoker ? '🚬 Still Smoking' : '🚭 Quit Smoking'}
                </span>
              </label>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateWhatIf}
              disabled={calculatingWhatIf}
              style={{
                padding: '1rem 2rem',
                background: calculatingWhatIf
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: calculatingWhatIf ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
              }}
            >
              {calculatingWhatIf ? (
                <>
                  <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Calculating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Calculate Impact
                </>
              )}
            </button>
          </div>

          {/* What-If Results */}
          {whatIfData && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <CheckCircle size={24} color="#10b981" />
                Your What-If Results
              </h2>

              {/* Impact Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {/* Life Years Gained */}
                <div style={{
                  background: whatIfData.lifeYearsGained > 0
                    ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                    : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: whatIfData.lifeYearsGained > 0 ? '#166534' : '#991b1b'
                  }}>
                    {whatIfData.lifeYearsGained > 0 ? '+' : ''}{(whatIfData.lifeYearsGained || 0).toFixed(1)}
                  </div>
                  <div style={{ fontWeight: '600', color: whatIfData.lifeYearsGained > 0 ? '#166534' : '#991b1b' }}>
                    Life Years
                  </div>
                </div>

                {/* Overall Risk Reduction */}
                <div style={{
                  background: whatIfData.overallRiskReduction > 0
                    ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                    : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: whatIfData.overallRiskReduction > 0 ? '#1e40af' : '#991b1b'
                  }}>
                    {whatIfData.overallRiskReduction > 0 ? '-' : '+'}{Math.abs(whatIfData.overallRiskReduction || 0).toFixed(1)}%
                  </div>
                  <div style={{ fontWeight: '600', color: whatIfData.overallRiskReduction > 0 ? '#1e40af' : '#991b1b' }}>
                    Overall Risk
                  </div>
                </div>

                {/* Impact Level */}
                <div style={{
                  background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: '800',
                    color: '#7c3aed'
                  }}>
                    {whatIfData.impactLevel}
                  </div>
                  <div style={{ fontWeight: '600', color: '#7c3aed' }}>
                    Impact Level
                  </div>
                </div>
              </div>

              {/* Changes Applied */}
              {whatIfData.changesApplied && whatIfData.changesApplied.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', color: '#1f2937' }}>Changes Applied:</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {whatIfData.changesApplied.map((change, index) => (
                      <div key={index} style={{
                        padding: '0.5rem 1rem',
                        background: '#f3f4f6',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {change}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Comparison Chart */}
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', color: '#1f2937' }}>Risk Comparison:</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  {
                    name: 'Heart Disease',
                    baseline: whatIfData.baselineRisks?.heartDisease || 0,
                    modified: whatIfData.modifiedRisks?.heartDisease || 0
                  },
                  {
                    name: 'Diabetes',
                    baseline: whatIfData.baselineRisks?.diabetes || 0,
                    modified: whatIfData.modifiedRisks?.diabetes || 0
                  },
                  {
                    name: 'Stroke',
                    baseline: whatIfData.baselineRisks?.stroke || 0,
                    modified: whatIfData.modifiedRisks?.stroke || 0
                  },
                  {
                    name: 'Cancer',
                    baseline: whatIfData.baselineRisks?.cancer || 0,
                    modified: whatIfData.modifiedRisks?.cancer || 0
                  }
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    formatter={(value) => [`${(value || 0).toFixed(1)}%`]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="baseline" name="Current" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="modified" name="With Changes" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'interventions' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Zap size={24} color="#f59e0b" />
            Intervention Impact Analysis
          </h2>
          <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
            See how different lifestyle changes can reduce your health risks
          </p>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {interventionImpacts && interventionImpacts.map((intervention, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, white 100%)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '1.5rem',
                  alignItems: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#1f2937'
                  }}>
                    <CheckCircle size={20} color="#10b981" />
                    {intervention.intervention}
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', color: '#4b5563' }}>
                    {intervention.description}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {intervention.heartRiskReduction && (
                      <div style={{
                        padding: '0.5rem 1rem',
                        background: '#fee2e2',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}>
                        <Heart size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        <span style={{ color: '#991b1b', fontWeight: '600' }}>
                          -{intervention.heartRiskReduction}% Heart
                        </span>
                      </div>
                    )}
                    {intervention.diabetesRiskReduction && (
                      <div style={{
                        padding: '0.5rem 1rem',
                        background: '#dbeafe',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}>
                        <Activity size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        <span style={{ color: '#1e40af', fontWeight: '600' }}>
                          -{intervention.diabetesRiskReduction}% Diabetes
                        </span>
                      </div>
                    )}
                    {intervention.strokeRiskReduction && (
                      <div style={{
                        padding: '0.5rem 1rem',
                        background: '#fef3c7',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}>
                        <Brain size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        <span style={{ color: '#92400e', fontWeight: '600' }}>
                          -{intervention.strokeRiskReduction}% Stroke
                        </span>
                      </div>
                    )}
                    {intervention.cancerRiskReduction && (
                      <div style={{
                        padding: '0.5rem 1rem',
                        background: '#dcfce7',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}>
                        <Target size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        <span style={{ color: '#166534', fontWeight: '600' }}>
                          -{intervention.cancerRiskReduction}% Cancer
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                      +{intervention.lifeYearsGained}
                    </span>
                    <span style={{ fontSize: '0.625rem', opacity: 0.9 }}>years</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {intervention.timeToEffect}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile button for regeneration */}
      {profileComplete && activeTab !== 'profile' && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={16} />
            Update Health Profile & Regenerate
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export default PredictiveTimeline

