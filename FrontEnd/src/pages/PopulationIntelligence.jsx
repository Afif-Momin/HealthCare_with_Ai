import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  TrendingUp,
  AlertTriangle,
  Heart,
  Brain,
  Activity,
  Globe,
  Sparkles,
  Droplets,
  Pill,
  Cigarette,
  Dumbbell,
  Moon,
  Apple,
  Wine,
  UserCheck,
  AlertCircle,
  ShieldAlert,
  Zap
} from 'lucide-react'
import { populationIntelligenceAPI } from '../services/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PopulationIntelligence = () => {
  const [populationData, setPopulationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPopulationData()
  }, [])

  const fetchPopulationData = async () => {
    try {
      setLoading(true)
      const response = await populationIntelligenceAPI.analyzeAll()
      console.log('Population data:', response.data)
      setPopulationData(response.data)
    } catch (error) {
      console.error('Error fetching population data:', error)
      setError('Failed to load population intelligence data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Analyzing population health data...</p>
      </div>
    )
  }

  if (error || !populationData) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <AlertTriangle size={36} color="#ff6b6b" />
          </div>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error || 'Population data not available'}</p>
          <button onClick={fetchPopulationData} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    )
  }

  // Extract data from backend response
  const totalPatients = populationData.totalPatients || 0
  const genderData = populationData.genderDistribution?.counts || {}
  const ageData = populationData.ageDistribution || {}
  const bloodGroups = populationData.bloodGroupDistribution || {}
  const vitalStats = populationData.vitalSignsStatistics || {}
  const cholesterolStats = populationData.cholesterolStatistics || {}
  const glucoseStats = populationData.glucoseStatistics || {}
  const lifestyle = populationData.lifestyleAnalysis || {}
  const medicalConditions = populationData.medicalConditions || {}
  const familyHistory = populationData.familyHistory || {}
  const riskFactors = populationData.riskFactorsSummary || {}

  // Prepare chart data
  const genderChartData = Object.entries(genderData).map(([name, value]) => ({ name, value }))
  const ageChartData = Object.entries(ageData.groups || {}).map(([name, value]) => ({ name, value }))
  const bloodGroupChartData = Object.entries(bloodGroups).map(([name, value]) => ({ name, value }))

  const smokingData = lifestyle.smoking ? [
    { name: 'Current Smokers', value: lifestyle.smoking.currentSmokers || 0, color: '#ef4444' },
    { name: 'Former Smokers', value: lifestyle.smoking.formerSmokers || 0, color: '#f59e0b' },
    { name: 'Never Smoked', value: lifestyle.smoking.neverSmoked || 0, color: '#10b981' },
  ] : []

  const COLORS = ['#00d4ff', '#a78bfa', '#00ff88', '#ffd700', '#ff6b6b', '#f472b6']

  const StatCard = ({ icon: Icon, label, value, subValue, color, gradient }) => (
    <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gradient }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', background: `${color}20`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={24} color={color} />
        </div>
        <div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f8fafc' }}>{value}</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{label}</div>
          {subValue && <div style={{ fontSize: '0.75rem', color: color, marginTop: '2px' }}>{subValue}</div>}
        </div>
      </div>
    </div>
  )

  const MetricCard = ({ icon: Icon, title, value, unit, status, statusColor }) => (
    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Icon size={20} color="#00d4ff" />
        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{title}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f8fafc' }}>
        {value} <span style={{ fontSize: '1rem', color: '#64748b' }}>{unit}</span>
      </div>
      {status && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: statusColor || '#10b981' }}>
          {status}
        </div>
      )}
    </div>
  )

  const ConditionBadge = ({ label, count, total, color }) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: '#1e293b',
        borderRadius: '10px',
        borderLeft: `3px solid ${color}`
      }}>
        <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: color, fontWeight: '600' }}>{count}</span>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({percentage}%)</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 212, 255, 0.1))',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #00ff88, #00d4ff)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 20px rgba(0, 255, 136, 0.3)' }}>
          <Globe size={36} color="white" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.5rem' }}>
          Population Health Intelligence
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Comprehensive analytics across {totalPatients} patients in your healthcare system
        </p>

        {/* Outbreak Detection Button */}
        <Link
          to="/outbreak-detection"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '0.95rem',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.4)'
          }}
        >
          <TrendingUp size={20} />
          🗺️ View Outbreak Detection Map
        </Link>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={Users} label="Total Patients" value={totalPatients} color="#00d4ff" gradient="linear-gradient(90deg, #00d4ff, #7c3aed)" />
        <StatCard icon={Activity} label="Average Age" value={ageData.averageAge ? Math.round(ageData.averageAge) : 'N/A'} subValue={ageData.minAge && ageData.maxAge ? `Range: ${ageData.minAge} - ${ageData.maxAge}` : null} color="#a78bfa" gradient="linear-gradient(90deg, #a78bfa, #7c3aed)" />
        <StatCard icon={ShieldAlert} label="High-Risk Patients" value={riskFactors.multipleRiskFactorsCount || 0} subValue="3+ risk factors" color="#ef4444" gradient="linear-gradient(90deg, #ef4444, #f59e0b)" />
        <StatCard icon={Cigarette} label="Current Smokers" value={lifestyle.smoking?.currentSmokers || 0} color="#f59e0b" gradient="linear-gradient(90deg, #f59e0b, #ef4444)" />
        <StatCard icon={Pill} label="On Medication" value={(medicalConditions.onBPMedication || 0) + (medicalConditions.onCholesterolMedication || 0)} subValue="BP or Cholesterol meds" color="#10b981" gradient="linear-gradient(90deg, #10b981, #00d4ff)" />
      </div>

      {/* Demographics Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={22} color="#00d4ff" />
          Demographics Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Gender Distribution */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '1rem' }}>Gender Distribution</h3>
            {genderChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderChartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No gender data available</div>
            )}
          </div>

          {/* Age Distribution */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '1rem' }}>Age Distribution</h3>
            {ageChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No age data available</div>
            )}
          </div>

          {/* Blood Group Distribution */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '1rem' }}>Blood Group Distribution</h3>
            {bloodGroupChartData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {bloodGroupChartData.map((item, index) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', fontWeight: '600', color: COLORS[index % COLORS.length] }}>{item.name}</div>
                    <div style={{ flex: 1, height: '24px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.value / totalPatients) * 100}%`, height: '100%', background: COLORS[index % COLORS.length], borderRadius: '6px', minWidth: '30px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                        <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>{item.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No blood group data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Health Metrics Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={22} color="#ef4444" />
          Population Health Metrics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <MetricCard
            icon={Activity}
            title="Avg Blood Pressure"
            value={vitalStats.systolicBP?.average ? `${Math.round(vitalStats.systolicBP.average)}/${Math.round(vitalStats.diastolicBP?.average || 0)}` : 'N/A'}
            unit="mmHg"
            status={vitalStats.systolicBP?.average > 130 ? "⚠️ Above normal average" : "✓ Normal range"}
            statusColor={vitalStats.systolicBP?.average > 130 ? "#f59e0b" : "#10b981"}
          />
          <MetricCard
            icon={Heart}
            title="Avg Heart Rate"
            value={vitalStats.restingHeartRate?.average ? Math.round(vitalStats.restingHeartRate.average) : 'N/A'}
            unit="bpm"
            status="Resting heart rate"
          />
          <MetricCard
            icon={Droplets}
            title="Avg Total Cholesterol"
            value={cholesterolStats.totalCholesterol?.average ? Math.round(cholesterolStats.totalCholesterol.average) : 'N/A'}
            unit="mg/dL"
            status={cholesterolStats.totalCholesterol?.highRiskCount > 0 ? `${cholesterolStats.totalCholesterol.highRiskCount} at high risk` : "All within range"}
            statusColor={cholesterolStats.totalCholesterol?.highRiskCount > 0 ? "#f59e0b" : "#10b981"}
          />
          <MetricCard
            icon={Zap}
            title="Avg Fasting Glucose"
            value={glucoseStats.fastingGlucose?.average ? Math.round(glucoseStats.fastingGlucose.average) : 'N/A'}
            unit="mg/dL"
            status={glucoseStats.fastingGlucose?.diabeticCount > 0 ? `${glucoseStats.fastingGlucose.diabeticCount} diabetic range` : "Normal range"}
            statusColor={glucoseStats.fastingGlucose?.diabeticCount > 0 ? "#ef4444" : "#10b981"}
          />
        </div>
      </div>

      {/* Lifestyle Analysis Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Dumbbell size={22} color="#10b981" />
          Lifestyle Analysis
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Smoking Status */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Cigarette size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0' }}>Smoking Status</h3>
            </div>
            {smokingData.length > 0 && smokingData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={smokingData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${value}`}>
                    {smokingData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No smoking data</div>
            )}
          </div>

          {/* Exercise Levels */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Dumbbell size={18} color="#10b981" />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0' }}>Exercise Activity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#1e293b', borderRadius: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Avg Hours/Week</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{lifestyle.exercise?.averageHoursPerWeek?.toFixed(1) || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, padding: '1rem', background: '#1e293b', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ef4444' }}>{lifestyle.exercise?.sedentaryCount || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sedentary</div>
                </div>
                <div style={{ flex: 1, padding: '1rem', background: '#1e293b', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>{lifestyle.exercise?.activeCount || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active (5+ hrs)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sleep & Stress */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Moon size={18} color="#a78bfa" />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0' }}>Sleep & Stress</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#1e293b', borderRadius: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Avg Sleep</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#a78bfa' }}>{lifestyle.sleep?.averageHoursPerNight?.toFixed(1) || 'N/A'} hrs</span>
              </div>
              <div style={{ padding: '1rem', background: '#1e293b', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Stress Levels</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {Object.entries(lifestyle.stressLevels || {}).map(([level, count]) => (
                    <span key={level} style={{
                      padding: '0.25rem 0.75rem',
                      background: level.toLowerCase() === 'high' ? '#ef444433' : level.toLowerCase() === 'moderate' ? '#f59e0b33' : '#10b98133',
                      color: level.toLowerCase() === 'high' ? '#ef4444' : level.toLowerCase() === 'moderate' ? '#f59e0b' : '#10b981',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {level}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Conditions & Family History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Medical Conditions */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={20} color="#00d4ff" />
            Medical Conditions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <ConditionBadge label="Diabetic" count={medicalConditions.diabetic || 0} total={totalPatients} color="#ef4444" />
            <ConditionBadge label="On BP Medication" count={medicalConditions.onBPMedication || 0} total={totalPatients} color="#f59e0b" />
            <ConditionBadge label="On Cholesterol Meds" count={medicalConditions.onCholesterolMedication || 0} total={totalPatients} color="#a78bfa" />
            <ConditionBadge label="Had Heart Attack" count={medicalConditions.hadHeartAttack || 0} total={totalPatients} color="#ef4444" />
            <ConditionBadge label="Had Stroke" count={medicalConditions.hadStroke || 0} total={totalPatients} color="#ef4444" />
            <ConditionBadge label="Anxiety" count={medicalConditions.anxiety || 0} total={totalPatients} color="#f472b6" />
            <ConditionBadge label="Depression" count={medicalConditions.depression || 0} total={totalPatients} color="#f472b6" />
          </div>
        </div>

        {/* Family History */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="#10b981" />
            Family History Prevalence
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <ConditionBadge label="Heart Disease" count={familyHistory.heartDisease || 0} total={totalPatients} color="#ef4444" />
            <ConditionBadge label="Diabetes" count={familyHistory.diabetes || 0} total={totalPatients} color="#f59e0b" />
            <ConditionBadge label="Hypertension" count={familyHistory.hypertension || 0} total={totalPatients} color="#00d4ff" />
            <ConditionBadge label="Stroke" count={familyHistory.stroke || 0} total={totalPatients} color="#ef4444" />
            <ConditionBadge label="Cancer" count={familyHistory.cancer || 0} total={totalPatients} color="#a78bfa" />
            <ConditionBadge label="Obesity" count={familyHistory.obesity || 0} total={totalPatients} color="#f472b6" />
          </div>
        </div>
      </div>

      {/* Risk Factors Dashboard */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} color="#ef4444" />
          Risk Factors Dashboard
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'High Blood Pressure', value: riskFactors.highBloodPressureRisk || 0, color: '#ef4444', icon: Activity },
            { label: 'High Cholesterol', value: riskFactors.highCholesterolRisk || 0, color: '#f59e0b', icon: Droplets },
            { label: 'Obesity (BMI ≥30)', value: riskFactors.obesityRisk || 0, color: '#f472b6', icon: UserCheck },
            { label: 'Smoking', value: riskFactors.smokingRisk || 0, color: '#ef4444', icon: Cigarette },
            { label: 'Sedentary Lifestyle', value: riskFactors.sedentaryLifestyleRisk || 0, color: '#a78bfa', icon: Moon },
            { label: 'Multiple Risks (3+)', value: riskFactors.multipleRiskFactorsCount || 0, color: '#ef4444', icon: AlertTriangle },
          ].map((risk) => {
            const Icon = risk.icon
            const percentage = totalPatients > 0 ? ((risk.value / totalPatients) * 100).toFixed(0) : 0
            return (
              <div key={risk.label} style={{
                padding: '1.25rem',
                background: '#1e293b',
                borderRadius: '12px',
                textAlign: 'center',
                border: `1px solid ${risk.color}33`
              }}>
                <Icon size={24} color={risk.color} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: risk.color }}>{risk.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{percentage}% of patients</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{risk.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(167, 139, 250, 0.1))', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="#00d4ff" />
          Key Population Insights
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {[
            {
              title: 'Cardiovascular Risk',
              insight: riskFactors.highBloodPressureRisk > 0 || riskFactors.highCholesterolRisk > 0
                ? `${(riskFactors.highBloodPressureRisk || 0) + (riskFactors.highCholesterolRisk || 0)} patients have elevated cardiovascular risk factors requiring monitoring.`
                : 'No patients currently flagged for high cardiovascular risk.',
              color: '#ef4444'
            },
            {
              title: 'Lifestyle Interventions',
              insight: lifestyle.exercise?.sedentaryCount > 0 || lifestyle.smoking?.currentSmokers > 0
                ? `${(lifestyle.exercise?.sedentaryCount || 0) + (lifestyle.smoking?.currentSmokers || 0)} patients could benefit from lifestyle intervention programs.`
                : 'Most patients maintain healthy lifestyle habits.',
              color: '#10b981'
            },
            {
              title: 'Metabolic Health',
              insight: glucoseStats.fastingGlucose?.prediabeticCount > 0 || glucoseStats.fastingGlucose?.diabeticCount > 0
                ? `${(glucoseStats.fastingGlucose?.prediabeticCount || 0) + (glucoseStats.fastingGlucose?.diabeticCount || 0)} patients show signs of metabolic dysfunction.`
                : 'Population metabolic health indicators are within normal ranges.',
              color: '#f59e0b'
            },
          ].map((item) => (
            <div key={item.title} style={{ padding: '1rem', background: '#0f172a', borderRadius: '12px', borderLeft: `3px solid ${item.color}` }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: item.color, marginBottom: '0.5rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.5' }}>{item.insight}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PopulationIntelligence
