// Analysis type requirements configuration
export const analysisRequirements = {
  'General Analysis': {
    required: [],
    recommended: [],
    description: 'General medical analysis. Select relevant medical records for comprehensive evaluation.'
  },
  'Diabetes': {
    required: [
      { type: 'Blood Report', fields: ['Fasting Blood Sugar', 'HbA1c', 'Postprandial Sugar'] }
    ],
    recommended: [
      { type: 'Blood Pressure', isManual: true, fields: ['Systolic', 'Diastolic'] }
    ],
    description: 'Requires blood report with Fasting Blood Sugar, HbA1c, and Postprandial Sugar. Blood pressure is optional but recommended.'
  },
  'Heart Attack/ECG': {
    required: [
      { type: 'ECG', fields: [] }
    ],
    recommended: [
      { type: 'Blood Report', fields: ['Cholesterol', 'Triglycerides', 'Blood Sugar'] }
    ],
    description: 'Requires ECG report. Blood report with Cholesterol, Triglycerides, and Blood Sugar is recommended for better accuracy.'
  },
  'MRI/Tumor': {
    required: [
      { type: 'MRI', fields: [], note: 'Brain MRI required' }
    ],
    recommended: [],
    description: 'Requires Brain MRI report for tumor detection and analysis.'
  },
  'Blood Pressure': {
    required: [
      { type: 'Blood Pressure', isManual: true, fields: ['Systolic', 'Diastolic'] }
    ],
    recommended: [
      { type: 'Blood Report', fields: ['Sodium', 'Cholesterol'] }
    ],
    description: 'Requires manual blood pressure input (Systolic/Diastolic). Blood report with Sodium and Cholesterol is recommended.'
  },
  'TB': {
    required: [
      { type: 'X-Ray', fields: [], note: 'Chest X-ray required' }
    ],
    recommended: [
      { type: 'Blood Report', fields: ['WBC', 'ESR'] }
    ],
    description: 'Requires Chest X-ray. Blood report with WBC and ESR is recommended for better accuracy.'
  },
  'Blood Report Analysis': {
    required: [
      { type: 'Blood Report', fields: [] }
    ],
    recommended: [],
    description: 'Requires blood report for comprehensive laboratory analysis.'
  }
}

// Get requirements for an analysis type
export const getAnalysisRequirements = (analysisType) => {
  return analysisRequirements[analysisType] || {
    required: [],
    recommended: [],
    description: 'Select medical records relevant to this analysis.'
  }
}

// Check if a medical record matches a requirement
export const recordMatchesRequirement = (record, requirement) => {
  if (requirement.isManual) {
    // Manual inputs are handled separately
    return false
  }
  
  const recordType = (record.recordType || '').toLowerCase().trim()
  const requiredType = (requirement.type || '').toLowerCase().trim()
  
  // Exact match
  if (recordType === requiredType) {
    return true
  }
  
  // Partial match for variations
  if (requiredType === 'blood report') {
    return recordType.includes('blood') || 
           recordType.includes('lab') || 
           recordType === 'lab report' ||
           recordType.includes('blood report')
  }
  
  if (requiredType === 'ecg') {
    return recordType.includes('ecg') || 
           recordType.includes('electrocardiogram') ||
           recordType.includes('ekg')
  }
  
  if (requiredType === 'mri') {
    return recordType.includes('mri') || 
           recordType.includes('magnetic resonance') ||
           (recordType.includes('brain') && recordType.includes('scan'))
  }
  
  if (requiredType === 'x-ray') {
    return recordType.includes('x-ray') || 
           recordType.includes('xray') || 
           recordType.includes('x ray') ||
           (recordType.includes('chest') && (recordType.includes('x') || recordType.includes('ray'))) ||
           recordType.includes('radiograph')
  }
  
  if (requiredType === 'blood pressure') {
    return recordType.includes('blood pressure') || 
           recordType.includes('bp') ||
           recordType.includes('hypertension')
  }
  
  return false
}

// Auto-select required records
export const autoSelectRequiredRecords = (medicalRecords, requirements) => {
  const selectedIds = []
  
  requirements.required.forEach(req => {
    if (req.isManual) {
      // Manual inputs are handled in the form
      return
    }
    
    // Find matching records
    const matchingRecords = medicalRecords.filter(record => 
      recordMatchesRequirement(record, req)
    )
    
    // Select the first matching record (or all if multiple needed)
    if (matchingRecords.length > 0) {
      matchingRecords.forEach(record => {
        if (!selectedIds.includes(record.id)) {
          selectedIds.push(record.id)
        }
      })
    }
  })
  
  return selectedIds
}

