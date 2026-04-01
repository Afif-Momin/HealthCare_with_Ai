import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Brain, RefreshCw, AlertTriangle, CheckCircle, Info, AlertCircle, TrendingUp, Activity, Shield, FileText } from 'lucide-react'
import { aiAnalysisAPI } from '../services/api'
import { formatDateTime } from '../utils/dateUtils'

const FormattedContent = ({ content }) => {
  const formatContent = (text) => {
    if (!text) return null
    
    const lines = text.split('\n')
    const elements = []
    let currentList = []
    let listType = null
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      // Headers
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="formatted-list">
              {currentList}
            </ul>
          )
          currentList = []
          listType = null
        }
        
        const headerText = trimmedLine.replace(/\*\*/g, '')
        const level = headerText.match(/^\d+\./) ? 'h3' : 'h4'
        elements.push(
          <div key={index} className={`formatted-header ${level}`}>
            {headerText}
          </div>
        )
      }
      // Horizontal line
      else if (trimmedLine === '---') {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="formatted-list">
              {currentList}
            </ul>
          )
          currentList = []
          listType = null
        }
        elements.push(<div key={index} className="formatted-divider" />)
      }
      // Bullet points
      else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const content = trimmedLine.substring(2)
        const formattedContent = content
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        
        currentList.push(
          <li key={index} dangerouslySetInnerHTML={{ __html: formattedContent }} />
        )
        listType = 'ul'
      }
      // Regular text
      else if (trimmedLine) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="formatted-list">
              {currentList}
            </ul>
          )
          currentList = []
          listType = null
        }
        
        const formattedContent = trimmedLine
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        
        elements.push(
          <p key={index} className="formatted-text" dangerouslySetInnerHTML={{ __html: formattedContent }} />
        )
      }
      // Empty line
      else if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="formatted-list">
            {currentList}
          </ul>
        )
        currentList = []
        listType = null
      }
    })
    
    // Add remaining list items
    if (currentList.length > 0) {
      elements.push(
        <ul key="final-list" className="formatted-list">
          {currentList}
        </ul>
      )
    }
    
    return elements
  }
  
  return <div className="formatted-content">{formatContent(content)}</div>
}

const StructuredReportView = ({ structuredReportJson }) => {
  const [report, setReport] = useState(null)

  useEffect(() => {
    if (structuredReportJson) {
      try {
        // Clean JSON if it has markdown code blocks
        let cleanedJson = structuredReportJson.trim()
        if (cleanedJson.startsWith('```json')) {
          cleanedJson = cleanedJson.substring(7)
        }
        if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.substring(3)
        }
        if (cleanedJson.endsWith('```')) {
          cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3)
        }
        cleanedJson = cleanedJson.trim()
        
        const parsed = JSON.parse(cleanedJson)
        setReport(parsed)
      } catch (error) {
        console.error('Error parsing structured report:', error)
        setReport(null)
      }
    }
  }, [structuredReportJson])

  if (!report) return null

  const getRiskColor = (riskLevel) => {
    const risk = riskLevel?.toLowerCase()
    if (risk === 'high') return '#ef4444'
    if (risk === 'moderate') return '#f59e0b'
    return '#10b981'
  }

  const getRiskBg = (riskLevel) => {
    const risk = riskLevel?.toLowerCase()
    if (risk === 'high') return '#fee2e2'
    if (risk === 'moderate') return '#fef3c7'
    return '#d1fae5'
  }

  const getStageColor = (stage) => {
    const s = stage?.toLowerCase()
    if (s === 'advanced') return '#ef4444'
    if (s === 'intermediate') return '#f59e0b'
    return '#3b82f6'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. PRIMARY CLINICAL SUMMARY */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <FileText size={24} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
            Primary Clinical Summary
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.7', opacity: 0.95 }}>
          {report.primaryClinicalSummary}
        </p>
      </div>

      {/* 2. PRIMARY CLINICAL IMPRESSION */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '700',
          color: '#111827',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Brain size={20} color="#8b5cf6" />
          Primary Clinical Impression
        </h3>
        <p style={{ margin: 0, color: '#374151', lineHeight: '1.7' }}>
          {report.primaryClinicalImpression}
        </p>
      </div>

      {/* 3. DISEASE STAGE & 4. RISK ASSESSMENT - Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Disease Stage */}
        {report.diseaseStage && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '700',
              color: '#111827',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Activity size={20} color={getStageColor(report.diseaseStage.stage)} />
              Disease Stage Classification
            </h3>
            <div style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: getStageColor(report.diseaseStage.stage) + '20',
              color: getStageColor(report.diseaseStage.stage),
              borderRadius: '6px',
              fontWeight: '700',
              marginBottom: '1rem',
              fontSize: '1rem'
            }}>
              {report.diseaseStage.stage}
            </div>
            {report.diseaseStage.explanation && (
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151', lineHeight: '1.8' }}>
                {report.diseaseStage.explanation.map((exp, idx) => (
                  <li key={idx}>{exp}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Risk Assessment */}
        {report.riskAssessment && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '700',
              color: '#111827',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <TrendingUp size={20} color={getRiskColor(report.riskAssessment.overallRiskLevel)} />
              Risk Assessment
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Overall Risk Level
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: getRiskBg(report.riskAssessment.overallRiskLevel),
                  color: getRiskColor(report.riskAssessment.overallRiskLevel),
                  borderRadius: '6px',
                  fontWeight: '700'
                }}>
                  {report.riskAssessment.overallRiskLevel}
                </div>
              </div>
              {report.riskAssessment.riskOfProgression !== null && report.riskAssessment.riskOfProgression !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Risk of Disease Progression
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                    {report.riskAssessment.riskOfProgression}%
                  </div>
                </div>
              )}
              {report.riskAssessment.confidenceScore !== null && report.riskAssessment.confidenceScore !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Confidence Score
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                    {report.riskAssessment.confidenceScore}%
                  </div>
                </div>
              )}
              {report.riskAssessment.riskFactors && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Risk Factors
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>
                    {report.riskAssessment.riskFactors}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. KEY INDICATORS */}
      {report.keyIndicators && report.keyIndicators.length > 0 && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700',
            color: '#111827',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Info size={20} color="#3b82f6" />
            Key Indicators Supporting This Assessment
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151', lineHeight: '1.8' }}>
            {report.keyIndicators.map((indicator, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{indicator}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. DIFFERENTIAL DIAGNOSIS */}
      {report.differentialDiagnosis && report.differentialDiagnosis.length > 0 && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700',
            color: '#111827',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Brain size={20} color="#8b5cf6" />
            Differential Diagnosis (Ranked)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {report.differentialDiagnosis.map((dd, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>
                    {dd.condition}
                  </div>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    background: dd.likelihood === 'High' ? '#fee2e2' : dd.likelihood === 'Moderate' ? '#fef3c7' : '#d1fae5',
                    color: dd.likelihood === 'High' ? '#991b1b' : dd.likelihood === 'Moderate' ? '#92400e' : '#065f46',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {dd.likelihood}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {dd.justification}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. ACTIONABLE RECOMMENDATIONS */}
      {report.recommendations && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700',
            color: '#111827',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={20} color="#10b981" />
            Actionable Recommendations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {report.recommendations.immediateActions && report.recommendations.immediateActions.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>
                  Immediate Actions
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151', lineHeight: '1.8' }}>
                  {report.recommendations.immediateActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.recommendations.furtherDiagnosticEvaluation && report.recommendations.furtherDiagnosticEvaluation.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>
                  Further Diagnostic Evaluation
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151', lineHeight: '1.8' }}>
                  {report.recommendations.furtherDiagnosticEvaluation.map((test, idx) => (
                    <li key={idx}>{test}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.recommendations.monitoringAndFollowUp && report.recommendations.monitoringAndFollowUp.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>
                  Monitoring & Follow-Up
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151', lineHeight: '1.8' }}>
                  {report.recommendations.monitoringAndFollowUp.map((monitor, idx) => (
                    <li key={idx}>{monitor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. WARNING SIGNS */}
      {report.warningSigns && report.warningSigns.length > 0 && (
        <div style={{
          background: '#fef2f2',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #fecaca',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700',
            color: '#991b1b',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} color="#ef4444" />
            Warning Signs & Safety Alerts
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#7f1d1d', lineHeight: '1.8' }}>
            {report.warningSigns.map((warning, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 9. UNCERTAINTY & LIMITATIONS */}
      {report.uncertaintyAndLimitations && (
        <div style={{
          background: '#fffbeb',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #fde68a',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700',
            color: '#92400e',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Info size={20} color="#f59e0b" />
            Uncertainty & Limitations
          </h3>
          <p style={{ margin: 0, color: '#78350f', lineHeight: '1.7' }}>
            {report.uncertaintyAndLimitations}
          </p>
        </div>
      )}

      {/* 10. FINAL AI NOTE */}
      {report.finalAINote && (
        <div style={{
          background: '#f0f9ff',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #bae6fd',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Shield size={20} color="#3b82f6" />
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '700',
              color: '#1e40af',
              margin: 0
            }}>
              Final AI Note
            </h3>
          </div>
          <p style={{ margin: 0, color: '#1e3a8a', lineHeight: '1.7', fontStyle: 'italic' }}>
            {report.finalAINote}
          </p>
        </div>
      )}
    </div>
  )
}

const AIAnalysisView = () => {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalysis()
  }, [id])

  useEffect(() => {
    if (analysis && (analysis.status === 'PROCESSING' || analysis.status === 'PENDING')) {
      const interval = setInterval(() => {
        fetchAnalysis()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [analysis?.status])

  const fetchAnalysis = async () => {
    try {
      const response = await aiAnalysisAPI.getById(id)
      setAnalysis(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analysis:', error)
      const errorMessage = error.response?.data?.message || 'Error loading analysis'
      alert(errorMessage)
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { 
        color: '#f59e0b', 
        bg: '#fef3c7', 
        icon: RefreshCw,
        text: 'Pending'
      },
      PROCESSING: { 
        color: '#3b82f6', 
        bg: '#dbeafe', 
        icon: RefreshCw,
        text: 'Processing'
      },
      COMPLETED: { 
        color: '#10b981', 
        bg: '#d1fae5', 
        icon: CheckCircle,
        text: 'Completed'
      },
      FAILED: { 
        color: '#ef4444', 
        bg: '#fee2e2', 
        icon: AlertTriangle,
        text: 'Failed'
      },
    }
    return configs[status] || configs.PROCESSING
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <RefreshCw size={32} style={{ 
          animation: 'spin 1s linear infinite',
          color: '#3b82f6'
        }} />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <p>Analysis not found</p>
        <Link 
          to="/ai-analysis" 
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500'
          }}
        >
          Back to AI Analysis
        </Link>
      </div>
    )
  }

  const statusConfig = getStatusConfig(analysis.status)
  const StatusIcon = statusConfig.icon

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .formatted-content {
          line-height: 1.8;
        }
        
        .formatted-header {
          margin: 1.5rem 0 1rem 0;
          font-weight: 700;
        }
        
        .formatted-header.h3 {
          font-size: 1.25rem;
          color: #1f2937;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .formatted-header.h4 {
          font-size: 1.1rem;
          color: #374151;
        }
        
        .formatted-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 1.5rem 0;
        }
        
        .formatted-list {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        
        .formatted-list li {
          margin: 0.5rem 0;
          color: #374151;
        }
        
        .formatted-list li strong {
          color: #1f2937;
          font-weight: 600;
        }
        
        .formatted-list li em {
          font-style: italic;
          color: #6b7280;
        }
        
        .formatted-text {
          margin: 0.75rem 0;
          color: #374151;
        }
        
        .formatted-text strong {
          color: #1f2937;
          font-weight: 600;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/ai-analysis"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            padding: '0.25rem 0'
          }}
        >
          <ArrowLeft size={16} />
          Back to AI Analysis
        </Link>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={28} color="white" />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700',
              margin: 0,
              color: '#111827'
            }}>
              {analysis.analysisType}
            </h1>
          </div>
        </div>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: statusConfig.bg,
          color: statusConfig.color,
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <StatusIcon size={16} />
          {statusConfig.text}
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            Patient Information
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                Patient Name
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                {analysis.patientName}
              </div>
            </div>
            {analysis.medicalRecordId && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                  Medical Record
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                  #{analysis.medicalRecordId}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            Analysis Details
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Confidence</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#10b981' }}>
                {analysis.confidenceScore}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Model</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                {analysis.modelVersion}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Created</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                {formatDateTime(analysis.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Data */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '1.5rem'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <Info size={20} color="#3b82f6" />
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>
            Input Data
          </h3>
        </div>
        <div style={{ 
          padding: '1.25rem', 
          background: '#f9fafb', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          whiteSpace: 'pre-wrap',
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.875rem',
          color: '#374151',
          lineHeight: '1.7'
        }}>
          {analysis.inputData}
        </div>
      </div>

      {/* Analysis Result */}
      {analysis.status === 'COMPLETED' && analysis.analysisResult && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Brain size={20} color="#8b5cf6" />
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>
              AI Analysis Result
            </h3>
          </div>
          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(to bottom, #faf5ff, #ffffff)', 
            borderRadius: '8px',
            border: '1px solid #e9d5ff'
          }}>
            {analysis.structuredReportJson ? (
              <StructuredReportView structuredReportJson={analysis.structuredReportJson} />
            ) : (
              <FormattedContent content={analysis.analysisResult} />
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.status === 'COMPLETED' && analysis.recommendations && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle size={20} color="#10b981" />
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>
              Recommendations
            </h3>
          </div>
          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(to bottom, #ecfdf5, #ffffff)', 
            borderRadius: '8px',
            border: '1px solid #a7f3d0'
          }}>
            <FormattedContent content={analysis.recommendations} />
          </div>
        </div>
      )}

      {/* Processing State */}
      {analysis.status === 'PROCESSING' && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <RefreshCw 
            size={40} 
            style={{ 
              animation: 'spin 1s linear infinite',
              color: '#3b82f6',
              marginBottom: '1rem'
            }} 
          />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Processing Analysis
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            The AI is analyzing the provided data. This may take a few moments...
          </p>
        </div>
      )}

      {/* Failed State */}
      {analysis.status === 'FAILED' && (
        <div style={{
          background: '#fef2f2',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #fecaca'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '700',
                color: '#991b1b',
                marginBottom: '0.5rem'
              }}>
                Analysis Failed
              </h3>
              <p style={{ color: '#7f1d1d', margin: 0 }}>
                {analysis.analysisResult || 'An error occurred during analysis'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAnalysisView