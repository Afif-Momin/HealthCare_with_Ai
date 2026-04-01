import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, MicOff, Volume2, VolumeX, AlertTriangle, CheckCircle, Brain, TrendingUp } from 'lucide-react'
import { aiAnalysisAPI } from '../services/api'

const VoiceEnabledAIAnalysis = ({ patientId, initialSymptoms, onComplete }) => {
  const navigate = useNavigate()
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [conversationHistory, setConversationHistory] = useState([])
  const [riskScore, setRiskScore] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [recommendation, setRecommendation] = useState('')
  const [fullAnalysisResult, setFullAnalysisResult] = useState(null)
  const [status, setStatus] = useState('ready') // ready, listening, analyzing, speaking
  const [error, setError] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [useVoice, setUseVoice] = useState(true)
  const [autoListenAfterSpeech, setAutoListenAfterSpeech] = useState(true)

  const recognitionRef = useRef(null)
  const synthesisRef = useRef(null)
  const currentTranscriptRef = useRef('')
  const statusRef = useRef('ready')
  const askedQuestionsRef = useRef(new Set()) // Track asked questions to prevent loops
  const conversationDataRef = useRef({
    symptoms: initialSymptoms || '',
    answers: [],
    questionsAsked: 0,
    minQuestions: 5, // Minimum questions to ask
    maxQuestions: 5  // Maximum questions - exactly 5 questions
  })
  
  // Keep statusRef in sync with status state
  useEffect(() => {
    statusRef.current = status
  }, [status])

  // Auto-start conversation if initial symptoms are provided
  useEffect(() => {
    if (initialSymptoms && initialSymptoms.trim() && conversationDataRef.current.questionsAsked === 0 && status === 'ready') {
      console.log('[Voice Consultation] 🚀 Auto-starting with initial symptoms:', initialSymptoms)
      console.log('[Voice Consultation] Initial state - questionsAsked:', conversationDataRef.current.questionsAsked)
      // Start the conversation by processing initial symptoms
      // This will generate the first question
      setTimeout(() => {
        handleVoiceInput(initialSymptoms)
      }, 500) // Small delay to ensure component is fully mounted
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser. Please use Chrome or Edge.')
      setUseVoice(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setStatus('listening')
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
      currentTranscriptRef.current = transcript
      setTranscript(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
      const finalTranscript = currentTranscriptRef.current.trim()
      if (finalTranscript) {
        handleVoiceInput(finalTranscript)
      }
      currentTranscriptRef.current = ''
      setTranscript('')
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setStatus('ready')
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please enable microphone access.')
      }
    }

    recognitionRef.current = recognition
    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [])

  // Text-to-Speech function
  const speak = (text, priority = 'normal') => {
    if (!useVoice || !('speechSynthesis' in window)) {
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
      setStatus('speaking')
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setStatus('ready')
      statusRef.current = 'ready'
      
      // Auto-start listening after AI finishes speaking (if enabled)
      if (autoListenAfterSpeech && useVoice && recognitionRef.current) {
        setTimeout(() => {
          // Check if we should still auto-listen (not complete, not already listening, not analyzing)
          const currentStatus = statusRef.current
          const shouldAutoListen = currentStatus !== 'complete' && 
                                   currentStatus !== 'analyzing' &&
                                   !isListening && 
                                   recognitionRef.current
          
          console.log(`[Voice Consultation] Auto-listen check - Status: ${currentStatus}, IsListening: ${isListening}, Should auto-listen: ${shouldAutoListen}`)
          
          if (shouldAutoListen) {
            try {
              recognitionRef.current.start()
              console.log('[Voice Consultation] Auto-started listening after AI speech')
            } catch (e) {
              // Already started or error, ignore
              const errorMsg = e.message || e.toString() || 'Unknown error'
              if (errorMsg.includes('already') || errorMsg.includes('started')) {
                console.log('[Voice Consultation] Recognition already active, skipping auto-start')
              } else {
                console.log('[Voice Consultation] Auto-listen error:', errorMsg)
              }
            }
          }
        }, 1200) // Small delay to ensure speech is fully done
      }
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
      setStatus('ready')
    }

    window.speechSynthesis.speak(utterance)
  }

  // Handle voice input
  const handleVoiceInput = async (text) => {
    if (!text.trim()) {
      console.log('[Voice Consultation] Empty input, ignoring')
      return
    }

    console.log(`[Voice Consultation] Processing user input: "${text.substring(0, 50)}..."`)
    const questionsAskedBefore = conversationDataRef.current.questionsAsked
    const answersCountBefore = conversationDataRef.current.answers.length
    console.log(`[Voice Consultation] Before processing - Questions asked: ${questionsAskedBefore}, Answers: ${answersCountBefore}`)
    
    setStatus('analyzing')
    
    // Check if this is the initial symptoms (no questions asked yet)
    const isInitialSymptoms = questionsAskedBefore === 0 && answersCountBefore === 0
    
    if (!isInitialSymptoms) {
      // This is an answer to a question - add it to answers
      conversationDataRef.current.answers.push(text)
    } else {
      // This is initial symptoms - store it but don't count as an answer yet
      conversationDataRef.current.symptoms = text
      console.log('[Voice Consultation] Initial symptoms provided, will generate first question')
    }
    
    // Add to conversation history
    setConversationHistory(prev => [
      ...prev,
      { type: 'user', content: text, timestamp: new Date() }
    ])

    try {
      // Build enhanced prompt for cross-questioning
      const analysisInput = buildAnalysisInput()
      const enhancedPrompt = buildCrossQuestioningPrompt(analysisInput)

      // Send to AI for analysis and next question
      const response = await aiAnalysisAPI.create({
        patientId: patientId,
        analysisType: 'Symptom Analysis',
        inputData: enhancedPrompt,
        modelVersion: 'v2.0-voice'
      })

      // Process AI response
      const analysis = response.data
      
      // Always store the analysis result
      setFullAnalysisResult(analysis)
      updateRiskMetrics(analysis)
      
      // Check if we should ask more questions or finalize
      const questionsAsked = conversationDataRef.current.questionsAsked
      const answersCount = conversationDataRef.current.answers.length
      const minQuestions = conversationDataRef.current.minQuestions
      const maxQuestions = conversationDataRef.current.maxQuestions
      
      console.log(`[Voice Consultation] After processing - Questions asked: ${questionsAsked}, Answers received: ${answersCount}, Min: ${minQuestions}, Max: ${maxQuestions}`)
      
      // CRITICAL: Only finalize AFTER user has answered all 5 questions
      // We finalize when: questionsAsked === 5 AND answersCount === 5
      // This ensures we wait for the user to answer the last question before finalizing
      const allQuestionsAsked = questionsAsked >= minQuestions
      const allQuestionsAnswered = answersCount >= minQuestions
      const shouldFinalizeNow = allQuestionsAsked && allQuestionsAnswered
      
      // Parse confidence score
      let confidenceValue = 0
      if (analysis.confidenceScore) {
        const confStr = analysis.confidenceScore.toString().replace('%', '').trim()
        confidenceValue = parseInt(confStr) || 0
      }
      
      console.log(`[Voice Consultation] Confidence: ${confidenceValue}%`)
      console.log(`[Voice Consultation] All questions asked: ${allQuestionsAsked}, All questions answered: ${allQuestionsAnswered}, Should finalize: ${shouldFinalizeNow}`)
      
      // CRITICAL: Only finalize if user has answered all 5 questions
      if (shouldFinalizeNow) {
        // User has answered all 5 questions - finalize now
        console.log(`[Voice Consultation] ✅ All ${minQuestions} questions asked and answered - finalizing analysis`)
        finalizeAnalysis(analysis)
        return
      }
      
      // If we haven't asked all questions yet, continue asking
      if (!allQuestionsAsked) {
        // MUST continue - haven't asked all questions yet
        console.log(`[Voice Consultation] ➡️ Continuing - asked ${questionsAsked} of ${minQuestions} questions, generating next question...`)
        await generateNextQuestion(analysis)
        return
      }
      
      // If we've asked all questions but user hasn't answered all yet
      // This means we just asked question 5, but user hasn't answered it yet
      // We should NOT generate another question, just wait for the answer
      if (allQuestionsAsked && !allQuestionsAnswered) {
        console.log(`[Voice Consultation] ⚠️ All ${minQuestions} questions asked (${questionsAsked}) but only ${answersCount} answers received - waiting for user to answer the last question`)
        // Don't generate another question, just wait - the user will answer and trigger finalization
        setStatus('ready')
        return
      }
    } catch (error) {
      console.error('Error analyzing voice input:', error)
      setError('Failed to analyze. Please try again.')
      setStatus('ready')
    }
  }

  // Build enhanced prompt for cross-questioning
  const buildCrossQuestioningPrompt = (baseInput) => {
    let prompt = baseInput + '\n\n'
    prompt += 'CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:\n\n'
    const currentQuestionNum = conversationDataRef.current.questionsAsked + 1
    prompt += `1. This is question number ${currentQuestionNum}. You MUST ask at least ${conversationDataRef.current.minQuestions} questions total.\n`
    prompt += '2. Analyze the symptoms and answers provided in detail\n'
    prompt += '3. Update risk assessment based on new information\n'
    const remainingQuestions = Math.max(0, conversationDataRef.current.minQuestions - conversationDataRef.current.questionsAsked)
    if (remainingQuestions > 0) {
      prompt += `4. YOU MUST ALWAYS generate a follow-up question. We need at least ${remainingQuestions} more questions.\n`
    } else {
      prompt += '4. Generate a follow-up question OR finalize the analysis if you have enough information.\n'
    }
    prompt += '5. The question MUST be:\n'
    prompt += '   - Directly relevant to the specific symptoms mentioned\n'
    prompt += '   - Different from ALL previous questions (see list below)\n'
    prompt += '   - Medically relevant and specific (not generic)\n'
    prompt += '   - Focused on gathering critical missing information\n'
    prompt += '   - Natural and conversational\n'
    prompt += '6. RESPONSE FORMAT - You MUST respond with valid JSON:\n'
    prompt += '{\n'
    prompt += '  "riskAssessment": { "riskOfProgression": <number 0-100>, "confidenceScore": <number 0-100> },\n'
    prompt += '  "followUpQuestion": "Your unique, specific, contextual question here?",\n'
    prompt += '  "reasoning": "Why this question is important"\n'
    prompt += '}\n'
    prompt += `7. IMPORTANT: This is question ${currentQuestionNum} of ${conversationDataRef.current.minQuestions} total questions. `
    if (remainingQuestions > 0) {
      prompt += `You MUST generate a question.\n`
    } else {
      prompt += `You can generate a question OR provide a final analysis summary.\n`
    }
    prompt += '8. DO NOT use generic questions like "describe more" or "any additional symptoms"\n'
    prompt += '9. Make questions SPECIFIC based on what the patient said\n'
    prompt += '10. Examples of GOOD questions:\n'
    prompt += '   - "You mentioned [specific symptom]. How long has this been occurring?"\n'
    prompt += '   - "When you experience [symptom], does it happen at a particular time of day?"\n'
    prompt += '   - "Have you noticed [symptom] getting worse with [specific activity]?"\n'
    prompt += '11. Examples of BAD questions (DO NOT USE):\n'
    prompt += '   - "Can you describe more?"\n'
    prompt += '   - "Any additional symptoms?"\n'
    prompt += '   - "Tell me more"\n'
    
    // Add conversation history to help AI avoid repetition
    if (conversationHistory.length > 0) {
      prompt += '\n\nPREVIOUS QUESTIONS ASKED (DO NOT REPEAT THESE - BE CREATIVE):\n'
      conversationHistory
        .filter(item => item.type === 'ai')
        .forEach((item, idx) => {
          prompt += `${idx + 1}. "${item.content}"\n`
        })
      prompt += '\nGenerate a COMPLETELY DIFFERENT question based on the conversation.\n'
    }
    
    prompt += '\nREMEMBER: Your response MUST be valid JSON with a followUpQuestion field.\n'
    
    return prompt
  }

  // Build analysis input from conversation
  const buildAnalysisInput = () => {
    const { symptoms, answers } = conversationDataRef.current
    let input = ''
    
    // Include initial symptoms if available
    if (symptoms && symptoms.trim()) {
      input += `Initial Symptoms: ${symptoms}\n\n`
    }
    
    // Include answers to questions
    if (answers.length > 0) {
      input += 'Follow-up Answers:\n'
      answers.forEach((answer, idx) => {
        input += `Q${idx + 1} Answer: ${answer}\n`
      })
    }
    
    return input
  }

  // Update risk metrics from AI analysis
  const updateRiskMetrics = (analysis) => {
    // Store full analysis result
    setFullAnalysisResult(analysis)
    
    // Parse structured report if available
    if (analysis.structuredReportJson) {
      try {
        // Clean JSON if it has markdown code blocks
        let cleanedJson = analysis.structuredReportJson.trim()
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
        
        const report = JSON.parse(cleanedJson)
        if (report.riskAssessment) {
          setRiskScore(report.riskAssessment.riskOfProgression)
          setConfidence(report.riskAssessment.confidenceScore)
          if (report.recommendations) {
            const immediateActions = report.recommendations.immediateActions || []
            const furtherEval = report.recommendations.furtherDiagnosticEvaluation || []
            const monitoring = report.recommendations.monitoringAndFollowUp || []
            const allRecs = [...immediateActions, ...furtherEval, ...monitoring]
            setRecommendation(allRecs.join('. ') || report.recommendations.immediateActions?.[0] || '')
          }
        }
      } catch (e) {
        console.error('Error parsing structured report:', e)
        // Fallback to basic parsing
        extractMetricsFromText(analysis.analysisResult)
      }
    } else {
      extractMetricsFromText(analysis.analysisResult)
    }
  }

  // Extract metrics from text (fallback)
  const extractMetricsFromText = (text) => {
    // Simple regex extraction
    const riskMatch = text.match(/risk[:\s]+(\d+)%/i)
    const confidenceMatch = text.match(/confidence[:\s]+(\d+)%/i)
    
    if (riskMatch) setRiskScore(parseInt(riskMatch[1]))
    if (confidenceMatch) setConfidence(parseInt(confidenceMatch[1]))
  }

  // Generate next question
  const generateNextQuestion = async (analysis) => {
    // Increment questions asked BEFORE extracting question
    const previousCount = conversationDataRef.current.questionsAsked
    conversationDataRef.current.questionsAsked++
    const newCount = conversationDataRef.current.questionsAsked
    console.log(`[Voice Consultation] Generating question ${newCount} of ${conversationDataRef.current.minQuestions} (was ${previousCount})`)
    
    // First, try to extract question from AI response
    let question = extractQuestionFromAnalysis(analysis.analysisResult || analysis.structuredReportJson || '')
    
    // Validate extracted question
    if (question) {
      // Check if it's generic (we don't want generic questions)
      const genericPatterns = [
        /describe.*more/i,
        /additional.*symptom/i,
        /anything else/i,
        /tell me more/i,
        /provide more detail/i,
        /can you describe/i
      ]
      const isGeneric = genericPatterns.some(pattern => pattern.test(question))
      
      // Check if question was already asked
      if (isGeneric || askedQuestionsRef.current.has(question) || question.length < 20) {
        question = null // Force generation of new question
      } else {
        // Valid question extracted
        askedQuestionsRef.current.add(question)
      }
    }
    
    // If no valid question extracted, generate one dynamically
    if (!question) {
      question = await generateContextualQuestion(analysis)
    }

    // Final validation - ensure we have a good question
    if (!question || question.length < 15) {
      // Last resort: create a symptom-specific question
      // Use the last answer if available, otherwise use initial symptoms
      const lastAnswer = conversationDataRef.current.answers.length > 0
        ? conversationDataRef.current.answers[conversationDataRef.current.answers.length - 1]
        : conversationDataRef.current.symptoms || ''
      const lastAnswerWords = lastAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      
      if (lastAnswerWords.length > 0) {
        const keyWord = lastAnswerWords[0]
        question = `You mentioned ${keyWord}. Can you tell me more about when this occurs and what makes it better or worse?`
      } else {
        question = `Can you provide more specific details about the timing and severity of your symptoms?`
      }
      
      // Check if this fallback was already used
      if (askedQuestionsRef.current.has(question)) {
        // Try a different approach
        question = `How would you describe the progression of your symptoms since they first started?`
      }
      
      askedQuestionsRef.current.add(question)
    }

    setAiQuestion(question)
    setConversationHistory(prev => [
      ...prev,
      { type: 'ai', content: question, timestamp: new Date() }
    ])

    // Speak the question
    if (useVoice) {
      speak(question)
    } else {
      // If voice is off, still set status to ready so user can respond
      setStatus('ready')
      statusRef.current = 'ready'
    }
    
    // Ensure status is set to ready after question is generated
    // This will be updated when speech ends (if voice is on)
    if (!useVoice) {
      setStatus('ready')
      statusRef.current = 'ready'
    }
    
    console.log(`[Voice Consultation] ✅ Question ${conversationDataRef.current.questionsAsked} generated and displayed: "${question.substring(0, 50)}..."`)
    console.log(`[Voice Consultation] 📊 Current state - Questions asked: ${conversationDataRef.current.questionsAsked}, Answers: ${conversationDataRef.current.answers.length}`)
  }

  // Extract question from AI response
  const extractQuestionFromAnalysis = (text) => {
    if (!text) {
      console.log('[Voice Consultation] No text provided for question extraction')
      return null
    }
    
    console.log(`[Voice Consultation] Extracting question from: "${text.substring(0, 100)}..."`)
    
    // Try to parse as JSON first (preferred format)
    try {
      // Clean JSON if it has markdown code blocks
      let cleanedText = text.trim()
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring(7)
      }
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.substring(3)
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3)
      }
      cleanedText = cleanedText.trim()
      
      // Try to find JSON object in the text (handle multiple JSON objects)
      const jsonMatches = cleanedText.match(/\{[\s\S]*?\}/g)
      if (jsonMatches && jsonMatches.length > 0) {
        // Try each JSON match
        for (const jsonStr of jsonMatches) {
          try {
            const jsonData = JSON.parse(jsonStr)
            if (jsonData.followUpQuestion) {
              let question = jsonData.followUpQuestion.trim()
              if (!question.endsWith('?')) question += '?'
              console.log(`[Voice Consultation] Extracted question from JSON: "${question}"`)
              return question
            }
            // Also check for "question" field (alternative format)
            if (jsonData.question) {
              let question = jsonData.question.trim()
              if (!question.endsWith('?')) question += '?'
              console.log(`[Voice Consultation] Extracted question from JSON (question field): "${question}"`)
              return question
            }
          } catch (e) {
            // Try next JSON match
            continue
          }
        }
      }
    } catch (e) {
      console.log('[Voice Consultation] JSON parsing failed, trying text extraction:', e.message)
      // Not valid JSON, try text extraction
    }
    
    // Look for question patterns in text (more flexible)
    const questionPatterns = [
      /(?:Do you|Have you|Are you|Did you|When did|How long|What|Where|Can you|Would you|Is there|Are there)[^?]+\?/gi,
      /(?:Tell me|Describe|Explain|Please share)[^?]+\?/gi,
      /(?:Have|Has|Had|Does|Did|Is|Are|Was|Were)[^?]+\?/gi
    ]
    
    for (const pattern of questionPatterns) {
      const matches = text.match(pattern)
      if (matches && matches.length > 0) {
        // Get the last question (most likely the follow-up)
        const question = matches[matches.length - 1].trim()
        if (question.length > 10 && question.length < 200) {
          return question
        }
      }
    }
    
    // Look for follow-up question sections
    const followUpMatch = text.match(/follow[-\s]?up question[:\s]+([^\.\n]+)/i)
    if (followUpMatch) {
      let question = followUpMatch[1].trim()
      if (!question.endsWith('?')) question += '?'
      if (question.length > 10) return question
    }
    
    // Look for question in quotes
    const quotedQuestion = text.match(/"([^"]+\?)"/)
    if (quotedQuestion) {
      return quotedQuestion[1]
    }
    
    return null
  }

  // Generate contextual question from AI analysis
  const generateContextualQuestion = async (analysis) => {
    // If we have analysis result, try to extract question from it first
    if (analysis.analysisResult) {
      const extracted = extractQuestionFromAnalysis(analysis.analysisResult)
      if (extracted && extracted.length > 20 && !askedQuestionsRef.current.has(extracted)) {
        // Check if it's not a generic question
        const genericPatterns = [
          /describe.*more/i,
          /additional.*symptom/i,
          /anything else/i,
          /tell me more/i,
          /provide more detail/i
        ]
        const isGeneric = genericPatterns.some(pattern => pattern.test(extracted))
        
        if (!isGeneric) {
          askedQuestionsRef.current.add(extracted)
          return extracted
        }
      }
    }
    
    // If extraction failed or question is generic, ask AI to generate a specific question
    try {
      const previousQuestions = Array.from(askedQuestionsRef.current)
      const conversationAsked = conversationHistory
        .filter(item => item.type === 'ai')
        .map(item => item.content)
      const allAsked = [...previousQuestions, ...conversationAsked]
      
      const prompt = `You are a medical AI assistant conducting a voice consultation. Generate ONE specific, contextual follow-up question.

CRITICAL REQUIREMENTS:
1. The question MUST be specific to the symptoms mentioned in the conversation
2. It MUST be different from all previous questions
3. It MUST be medically relevant and help gather critical information
4. DO NOT use generic phrases like "describe more", "additional symptoms", "anything else"

Previous questions asked (DO NOT REPEAT):
${allAsked.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

Conversation so far:
${buildAnalysisInput()}

Generate ONLY a specific, contextual question. Make it relevant to what the patient said. Format as JSON:
{"question": "Your specific question here?"}`

      const response = await aiAnalysisAPI.create({
        patientId: patientId,
        analysisType: 'Symptom Analysis',
        inputData: prompt,
        modelVersion: 'v2.0-voice-question'
      })

      if (response.data && response.data.analysisResult) {
        let question = response.data.analysisResult.trim()
        
        // Try to extract from JSON
        try {
          const jsonMatch = question.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[0])
            if (jsonData.question) {
              question = jsonData.question
            }
          }
        } catch (e) {
          // Not JSON, continue with text extraction
        }
        
        // Clean up the question
        question = question.replace(/^question[:\s]+/i, '')
        question = question.replace(/^q[:\s]+/i, '')
        question = question.replace(/^["']|["']$/g, '') // Remove quotes
        question = question.trim()
        
        // Ensure it ends with ?
        if (!question.endsWith('?')) {
          question += '?'
        }
        
        // Check if it's generic
        const genericPatterns = [
          /describe.*more/i,
          /additional.*symptom/i,
          /anything else/i,
          /tell me more/i,
          /provide more detail/i,
          /can you describe/i
        ]
        const isGeneric = genericPatterns.some(pattern => pattern.test(question))
        
        if (question && question.length > 20 && !isGeneric && !askedQuestionsRef.current.has(question)) {
          askedQuestionsRef.current.add(question)
          return question
        }
      }
    } catch (error) {
      console.error('Error generating contextual question:', error)
    }
    
    // Last resort: Create a specific question based on symptoms mentioned
    const symptoms = conversationDataRef.current.symptoms.toLowerCase()
    const answers = conversationDataRef.current.answers.join(' ').toLowerCase()
    const combined = symptoms + ' ' + answers
    
    let specificQuestion = null
    
    // Generate specific question based on what was mentioned
    if (combined.includes('cough') || combined.includes('coughing')) {
      specificQuestion = "How long have you been experiencing the cough, and is it productive (with phlegm) or dry?"
    } else if (combined.includes('fever') || combined.includes('temperature')) {
      specificQuestion = "What is your current body temperature, and does it fluctuate throughout the day?"
    } else if (combined.includes('pain') || combined.includes('ache')) {
      specificQuestion = "On a scale of 1 to 10, how would you rate the intensity of the pain?"
    } else if (combined.includes('breath') || combined.includes('breathing')) {
      specificQuestion = "Does the shortness of breath occur at rest or only during physical activity?"
    } else if (combined.includes('weight')) {
      specificQuestion = "How much weight have you lost, and over what period of time?"
    } else {
      // Extract first significant symptom and ask about it
      const words = combined.split(/\s+/).filter(w => w.length > 4)
      if (words.length > 0) {
        const symptom = words[0]
        specificQuestion = `You mentioned ${symptom}. Can you tell me more specifically about when this started and how it has progressed?`
      }
    }
    
    if (specificQuestion && !askedQuestionsRef.current.has(specificQuestion)) {
      askedQuestionsRef.current.add(specificQuestion)
      return specificQuestion
    }
    
    // Absolute fallback - but make it contextual
    const fallback = conversationDataRef.current.answers.length > 0
      ? `Based on your previous answer, can you provide more specific details about the timing and severity?`
      : `Can you describe when these symptoms first started and how they've changed over time?`
    
    askedQuestionsRef.current.add(fallback)
    return fallback
  }

  // Finalize analysis
  const finalizeAnalysis = (analysis) => {
    // Safety check - ensure we've asked minimum questions
    const questionsAsked = conversationDataRef.current.questionsAsked
    const minQuestions = conversationDataRef.current.minQuestions
    
    if (questionsAsked < minQuestions) {
      console.error(`[Voice Consultation] ⚠️ ERROR: Attempted to finalize with only ${questionsAsked} questions (minimum: ${minQuestions})`)
      console.log(`[Voice Consultation] Continuing instead of finalizing...`)
      // Don't finalize - continue asking questions
      generateNextQuestion(analysis)
      return
    }
    
    console.log(`[Voice Consultation] ✅ Finalizing with ${questionsAsked} questions asked (minimum: ${minQuestions})`)
    setStatus('complete')
    statusRef.current = 'complete'
    setAiQuestion('')
    setAutoListenAfterSpeech(false) // Stop auto-listening after completion
    
    // Ensure full analysis result is stored
    if (analysis && !fullAnalysisResult) {
      setFullAnalysisResult(analysis)
    }
    
    // Build comprehensive summary
    let summary = 'Based on our conversation, your risk assessment is complete. '
    
    if (analysis && analysis.structuredReportJson) {
      try {
        let cleanedJson = analysis.structuredReportJson.trim()
        if (cleanedJson.startsWith('```json')) cleanedJson = cleanedJson.substring(7)
        if (cleanedJson.startsWith('```')) cleanedJson = cleanedJson.substring(3)
        if (cleanedJson.endsWith('```')) cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3)
        cleanedJson = cleanedJson.trim()
        
        const report = JSON.parse(cleanedJson)
        if (report.primaryClinicalSummary) {
          summary = report.primaryClinicalSummary + ' '
        }
        if (report.recommendations) {
          const recs = [
            ...(report.recommendations.immediateActions || []),
            ...(report.recommendations.furtherDiagnosticEvaluation || []),
            ...(report.recommendations.monitoringAndFollowUp || [])
          ]
          if (recs.length > 0) {
            summary += 'Recommendations: ' + recs.slice(0, 3).join('. ') + '.'
          }
        }
      } catch (e) {
        console.error('Error parsing final analysis:', e)
        summary += analysis.recommendations || analysis.analysisResult || 'Please consult with a healthcare professional for further evaluation.'
      }
    } else if (analysis && analysis.analysisResult) {
      // Use the formatted analysis result
      summary += 'Please review the complete analysis below.'
    } else {
      summary += analysis?.recommendations || 'Please consult with a healthcare professional for further evaluation.'
    }
    
    setConversationHistory(prev => [
      ...prev,
      { type: 'ai', content: summary, timestamp: new Date() }
    ])

    if (useVoice) {
      speak(summary)
    }

    // Delay onComplete to ensure UI updates
    setTimeout(() => {
      if (onComplete && analysis) {
        onComplete(analysis)
      }
    }, 1000)
  }

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && !isListening && status !== 'complete') {
      setError(null)
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('Error starting recognition:', e)
        setError('Unable to start microphone. Please check permissions.')
      }
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel()
    }
  }

  // Handle manual input submit
  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    await handleVoiceInput(manualInput)
    setManualInput('')
  }

  // Get status color
  const getStatusColor = () => {
    if (riskScore === null) return '#6b7280'
    if (riskScore >= 70) return '#ef4444'
    if (riskScore >= 40) return '#f59e0b'
    return '#10b981'
  }

  // Get confidence label
  const getConfidenceLabel = () => {
    if (!confidence) return 'Calculating...'
    if (confidence >= 80) return 'High'
    if (confidence >= 60) return 'Moderate'
    return 'Low'
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }
        .listening-pulse {
          animation: pulse 1.2s ease-in-out infinite;
        }
        .speaking-wave {
          animation: wave 0.5s ease-in-out infinite;
        }
        .mic-button-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Brain size={28} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            AI Health Assistant
          </h2>
        </div>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem' }}>
          Voice-enabled medical consultation
        </p>
      </div>

      {/* Status Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        padding: '0.75rem',
        background: status === 'listening' ? '#dbeafe' : status === 'speaking' ? '#f3e8ff' : '#f9fafb',
        borderRadius: '8px',
        border: `1px solid ${status === 'listening' ? '#3b82f6' : status === 'speaking' ? '#8b5cf6' : '#e5e7eb'}`
      }}>
        {status === 'listening' && (
          <>
            <Mic size={20} color="#3b82f6" className="listening-pulse" />
            <span style={{ color: '#1e40af', fontWeight: '600' }}>Listening...</span>
          </>
        )}
        {status === 'speaking' && (
          <>
            <Volume2 size={20} color="#8b5cf6" className="speaking-wave" />
            <span style={{ color: '#6b21a8', fontWeight: '600' }}>Speaking...</span>
          </>
        )}
        {status === 'analyzing' && (
          <>
            <Brain size={20} color="#6b7280" />
            <span style={{ color: '#374151', fontWeight: '600' }}>Analyzing...</span>
          </>
        )}
        {status === 'ready' && (
          <>
            <CheckCircle size={20} color="#10b981" />
            <span style={{ color: '#065f46', fontWeight: '600' }}>Ready</span>
          </>
        )}
        {status === 'complete' && (
          <>
            <CheckCircle size={20} color="#10b981" />
            <span style={{ color: '#065f46', fontWeight: '600' }}>Analysis Complete</span>
          </>
        )}
      </div>

      {/* Risk Score Card */}
      {(riskScore !== null || confidence !== null) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {riskScore !== null && (
            <div style={{
              padding: '1.5rem',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Risk Score
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: getStatusColor()
              }}>
                {riskScore}%
              </div>
            </div>
          )}
          {confidence !== null && (
            <div style={{
              padding: '1.5rem',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Confidence
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#3b82f6'
              }}>
                {getConfidenceLabel()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Question Display */}
      {aiQuestion && (
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
          borderRadius: '16px',
          border: '2px solid #8b5cf6',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
          animation: 'fadeIn 0.3s ease-in'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '0.75rem' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem' 
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={24} color="white" />
              </div>
              <strong style={{ color: '#6b21a8', fontSize: '1.125rem' }}>AI Question:</strong>
            </div>
            <div style={{
              padding: '0.5rem 1rem',
              background: conversationDataRef.current.questionsAsked < conversationDataRef.current.minQuestions 
                ? '#fef3c7' 
                : '#dbeafe',
              color: conversationDataRef.current.questionsAsked < conversationDataRef.current.minQuestions 
                ? '#92400e' 
                : '#1e40af',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '700'
            }}>
              Question {conversationDataRef.current.questionsAsked} of {conversationDataRef.current.minQuestions}
            </div>
          </div>
          <p style={{ 
            margin: 0, 
            color: '#374151', 
            lineHeight: '1.8',
            fontSize: '1.0625rem',
            fontWeight: '500'
          }}>
            {aiQuestion}
          </p>
        </div>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          marginBottom: '1.5rem',
          padding: '1.25rem',
          background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <Brain size={20} color="#6b7280" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#374151' }}>
              Conversation History
            </h4>
          </div>
          {conversationHistory.map((item, idx) => (
            <div key={idx} style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: item.type === 'ai' 
                ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' 
                : 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
              borderRadius: '10px',
              borderLeft: `4px solid ${item.type === 'ai' ? '#3b82f6' : '#10b981'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                {item.type === 'ai' ? (
                  <Brain size={16} color="#3b82f6" />
                ) : (
                  <Mic size={16} color="#10b981" />
                )}
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {item.type === 'ai' ? 'AI Assistant' : 'You'}
                </span>
              </div>
              <div style={{ 
                color: '#374151', 
                lineHeight: '1.7',
                fontSize: '0.9375rem'
              }}>
                {item.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voice Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {/* Voice Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>
            Voice Interaction
          </span>
          <button
            onClick={() => {
              setUseVoice(!useVoice)
              if (!useVoice && isSpeaking) {
                window.speechSynthesis.cancel()
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              background: useVoice ? '#10b981' : '#e5e7eb',
              color: useVoice ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            {useVoice ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Voice Input Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={status === 'analyzing' || status === 'complete'}
          style={{
            width: '100%',
            padding: '1.75rem',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : status === 'complete'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '1.125rem',
            fontWeight: '700',
            cursor: (status === 'analyzing' || status === 'complete') ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            opacity: (status === 'analyzing') ? 0.7 : 1,
            boxShadow: isListening 
              ? '0 8px 20px rgba(239, 68, 68, 0.5)' 
              : status === 'complete'
              ? '0 8px 20px rgba(16, 185, 129, 0.4)'
              : '0 8px 20px rgba(59, 130, 246, 0.4)',
            transform: isListening ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          {isListening ? (
            <>
              <MicOff size={28} className="listening-pulse" />
              <span>Stop Listening</span>
            </>
          ) : status === 'complete' ? (
            <>
              <CheckCircle size={28} />
              <span>Analysis Complete</span>
            </>
          ) : (
            <>
              <Mic size={28} />
              <span>Start Speaking</span>
            </>
          )}
        </button>
        
        {status === 'ready' && !isListening && !isSpeaking && conversationHistory.length === 0 && (
          <p style={{
            textAlign: 'center',
            marginTop: '1rem',
            color: '#6b7280',
            fontSize: '0.875rem',
            fontStyle: 'italic'
          }}>
            Click the button above to start speaking your symptoms
          </p>
        )}
        
        {status === 'ready' && !isListening && !isSpeaking && conversationHistory.length > 0 && (
          <p style={{
            textAlign: 'center',
            marginTop: '1rem',
            color: '#3b82f6',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            Ready to listen for your answer...
          </p>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div style={{
            padding: '1rem',
            background: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #fde68a'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.25rem', fontWeight: '600' }}>
              You said:
            </div>
            <div style={{ color: '#78350f' }}>{transcript}</div>
          </div>
        )}
      </div>

      {/* Manual Input Fallback */}
      <div style={{
        padding: '1rem',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <form onSubmit={handleManualSubmit}>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
            Or type your answer:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Type your symptoms or answer here..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || status === 'analyzing'}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: manualInput.trim() && status !== 'analyzing' ? 'pointer' : 'not-allowed',
                opacity: manualInput.trim() && status !== 'analyzing' ? 1 : 0.6,
                fontWeight: '600'
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Full Analysis Result */}
      {(fullAnalysisResult || status === 'complete') && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          background: 'white',
          borderRadius: '12px',
          border: '2px solid #8b5cf6',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Brain size={28} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>
                Complete Analysis Result
              </h3>
              {fullAnalysisResult?.id && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  Analysis ID: #{fullAnalysisResult.id}
                </p>
              )}
            </div>
          </div>
          
          {fullAnalysisResult?.analysisResult ? (
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(to bottom, #faf5ff, #ffffff)',
              borderRadius: '10px',
              border: '1px solid #e9d5ff',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              <div style={{
                color: '#374151',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontSize: '0.9375rem'
              }}>
                {fullAnalysisResult.analysisResult}
              </div>
            </div>
          ) : fullAnalysisResult?.structuredReportJson ? (
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(to bottom, #faf5ff, #ffffff)',
              borderRadius: '10px',
              border: '1px solid #e9d5ff',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              <div style={{
                color: '#374151',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontSize: '0.9375rem'
              }}>
                {fullAnalysisResult.analysisResult || 'Processing analysis result...'}
              </div>
            </div>
          ) : status === 'complete' ? (
            <div style={{
              padding: '1.5rem',
              background: '#fef3c7',
              borderRadius: '10px',
              border: '1px solid #fde68a',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#92400e' }}>
                Analysis is being processed. Please wait...
              </p>
            </div>
          ) : null}
          
          {fullAnalysisResult?.id && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={() => navigate(`/ai-analysis/${fullAnalysisResult.id}`)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)'
                }}
              >
                View Full Analysis Report →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div style={{
          marginTop: '1rem',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          borderRadius: '12px',
          border: '2px solid #10b981',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <CheckCircle size={24} color="#10b981" />
            <strong style={{ color: '#065f46', fontSize: '1.125rem' }}>Recommendations:</strong>
          </div>
          <p style={{ margin: 0, color: '#047857', lineHeight: '1.8', fontSize: '0.9375rem' }}>
            {recommendation}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertTriangle size={20} color="#ef4444" />
          <span style={{ color: '#991b1b' }}>{error}</span>
        </div>
      )}

      {/* Safety Notice */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#fffbeb',
        borderRadius: '8px',
        border: '1px solid #fde68a',
        fontSize: '0.875rem',
        color: '#92400e'
      }}>
        <strong>⚠️ Important:</strong> This AI assistant provides preliminary analysis only. 
        It does not replace professional medical consultation. For emergencies, consult a doctor immediately.
      </div>
    </div>
  )
}

export default VoiceEnabledAIAnalysis

