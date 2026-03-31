package com.medicalai.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicalai.dto.AIAnalysisDTO;
import com.medicalai.dto.AIAnalysisRequest;
import com.medicalai.dto.StructuredAnalysisReport;
import com.medicalai.entity.AIAnalysis;
import com.medicalai.entity.MedicalRecord;
import com.medicalai.entity.Patient;
import com.medicalai.exception.ResourceNotFoundException;
import com.medicalai.repository.AIAnalysisRepository;
import com.medicalai.repository.MedicalRecordRepository;
import com.medicalai.repository.PatientRepository;

@Service
@Transactional
public class AIAnalysisService {

    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private EmailService emailService;

    private final ObjectMapper objectMapper;
    
    {
        objectMapper = new ObjectMapper();
        // Configure to ignore unknown properties (for question-only responses)
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
//
//    public AIAnalysisDTO createAIAnalysis(AIAnalysisRequest request) {
//        Patient patient = patientRepository.findById(request.getPatientId())
//                .orElseThrow(() -> new ResourceNotFoundException("Patient", request.getPatientId()));
//
//        AIAnalysis analysis = new AIAnalysis();
//        analysis.setPatient(patient);
//        analysis.setAnalysisType(request.getAnalysisType());
//        analysis.setInputData(request.getInputData());
//        analysis.setModelVersion(request.getModelVersion() != null ? request.getModelVersion() : "v1.0");
//
//        // If medical record ID is provided, link it
//        if (request.getMedicalRecordId() != null) {
//            MedicalRecord record = medicalRecordRepository.findById(request.getMedicalRecordId())
//                    .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", request.getMedicalRecordId()));
//            analysis.setMedicalRecord(record);
//        }
//
//        // Set status to processing
//        analysis.setStatus(AIAnalysis.AnalysisStatus.PROCESSING);
//        AIAnalysis savedAnalysis = aiAnalysisRepository.save(analysis);
//
//        try {
//            // Call Gemini API for AI analysis
//            String analysisResult = geminiService.generateContent(request.getInputData(), request.getAnalysisType());
//            
//            // Extract recommendations from the analysis result
//            String recommendations = extractRecommendations(analysisResult);
//            
//            // Update analysis with results
//            savedAnalysis.setAnalysisResult(analysisResult);
//            savedAnalysis.setConfidenceScore("85%");
//            savedAnalysis.setRecommendations(recommendations);
//            savedAnalysis.setStatus(AIAnalysis.AnalysisStatus.COMPLETED);
//        } catch (Exception e) {
//            savedAnalysis.setAnalysisResult("Error during AI analysis: " + e.getMessage());
//            savedAnalysis.setStatus(AIAnalysis.AnalysisStatus.FAILED);
//        }
//
//        savedAnalysis = aiAnalysisRepository.save(savedAnalysis);
//
//        return convertToDTO(savedAnalysis);
//    }
    public AIAnalysisDTO createAIAnalysis(AIAnalysisRequest request) {

        // 1️⃣ Validate patient existence
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient", request.getPatientId())
                );

        // 2️⃣ Create analysis entity
        AIAnalysis analysis = new AIAnalysis();
        analysis.setPatient(patient);
        analysis.setAnalysisType(request.getAnalysisType().trim());
        analysis.setInputData(request.getInputData().trim());
        analysis.setModelVersion(
                request.getModelVersion() != null && !request.getModelVersion().isBlank()
                        ? request.getModelVersion().trim()
                        : "v1.0"
        );

        // 3️⃣ Link medical record(s) if provided
        // Handle multiple records (new feature) or single record (backward compatibility)
        if (request.getMedicalRecordIds() != null && !request.getMedicalRecordIds().isEmpty()) {
            // Multiple records - link the first one for backward compatibility, but include all in input data
            Long firstRecordId = request.getMedicalRecordIds().get(0);
            MedicalRecord record = medicalRecordRepository.findById(firstRecordId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("MedicalRecord", firstRecordId)
                    );
            analysis.setMedicalRecord(record);
        } else if (request.getMedicalRecordId() != null) {
            // Single record (backward compatibility)
            MedicalRecord record = medicalRecordRepository.findById(request.getMedicalRecordId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("MedicalRecord", request.getMedicalRecordId())
                    );
            analysis.setMedicalRecord(record);
        }

        // 4️⃣ Initialize safe default state (CRITICAL)
        analysis.setStatus(AIAnalysis.AnalysisStatus.PROCESSING);
        analysis.setAnalysisResult("AI analysis in progress...");
        analysis.setConfidenceScore(null);
        analysis.setRecommendations(null);

        // 5️⃣ Persist initial state
        AIAnalysis savedAnalysis = aiAnalysisRepository.save(analysis);

        try {
            // 6️⃣ Call AI engine
            String analysisResult = geminiService.generateContent(
                    request.getInputData(),
                    request.getAnalysisType()
            );

            // 7️⃣ Defensive result handling
            if (analysisResult == null || analysisResult.isBlank()) {
                throw new IllegalStateException("AI returned empty analysis result");
            }

            // 8️⃣ Parse JSON and extract structured data
            StructuredAnalysisReport structuredReport = parseStructuredReport(analysisResult);
            
            // 9️⃣ Save structured JSON (always save the raw response)
            savedAnalysis.setStructuredReportJson(analysisResult);
            
            // 🔟 Generate human-readable formatted text from structured data
            String formattedResult;
            String recommendations;
            String confidenceScore;
            
            if (structuredReport != null) {
                // Full structured report available
                formattedResult = formatStructuredReport(structuredReport);
                recommendations = formatRecommendations(structuredReport);
                confidenceScore = structuredReport.getRiskAssessment() != null &&
                                structuredReport.getRiskAssessment().getConfidenceScore() != null
                                ? structuredReport.getRiskAssessment().getConfidenceScore() + "%"
                                : calculateConfidenceScore(analysisResult);
            } else {
                // Not a structured report (might be question-only or plain text)
                // Use the raw result and extract what we can
                formattedResult = analysisResult;
                recommendations = extractRecommendationsFromText(analysisResult);
                confidenceScore = extractConfidenceFromText(analysisResult);
            }

            // 1️⃣1️⃣ Update successful analysis
            savedAnalysis.setAnalysisResult(formattedResult);
            savedAnalysis.setConfidenceScore(confidenceScore);
            savedAnalysis.setRecommendations(recommendations);
            savedAnalysis.setStatus(AIAnalysis.AnalysisStatus.COMPLETED);
            
            // 1️⃣2️⃣ Send email report to patient
            try {
                emailService.sendAnalysisReport(patient, savedAnalysis);
            } catch (Exception e) {
                System.err.println("Failed to send email report: " + e.getMessage());
                // Don't fail the analysis if email fails
            }

        } catch (Exception e) {

            // 🔟 Safe failure state (never leak raw exception)
            savedAnalysis.setAnalysisResult(
                    "AI analysis failed. Please retry or request manual review."
            );
            savedAnalysis.setConfidenceScore("0%");
            savedAnalysis.setRecommendations(
                    "Manual review recommended due to AI processing failure."
            );
            savedAnalysis.setStatus(AIAnalysis.AnalysisStatus.FAILED);

            // (Optional but recommended)
            System.out.printf("AI analysis failed for analysisId={}", savedAnalysis.getId(),e);
        }

        // 1️⃣1️⃣ Persist final state
        savedAnalysis = aiAnalysisRepository.save(savedAnalysis);

        // 1️⃣2️⃣ Return DTO
        return convertToDTO(savedAnalysis);
    }
    private String calculateConfidenceScore(String analysisResult) {
        int length = analysisResult.length();

        if (length > 1000) return "90%";
        if (length > 600)  return "85%";
        if (length > 300)  return "75%";
        return "65%";
    }


    public AIAnalysisDTO getAIAnalysisById(Long id) {
        AIAnalysis analysis = aiAnalysisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AIAnalysis", id));
        return convertToDTO(analysis);
    }

    public List<AIAnalysisDTO> getAllAIAnalyses() {
        return aiAnalysisRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AIAnalysisDTO> getAIAnalysesByPatientId(Long patientId) {
        return aiAnalysisRepository.findByPatientId(patientId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AIAnalysisDTO> getAIAnalysesByType(String analysisType) {
        return aiAnalysisRepository.findByAnalysisType(analysisType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AIAnalysisDTO updateAIAnalysis(Long id, AIAnalysisDTO analysisDTO) {
        AIAnalysis analysis = aiAnalysisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AIAnalysis", id));

        analysis.setAnalysisType(analysisDTO.getAnalysisType());
        analysis.setInputData(analysisDTO.getInputData());
        analysis.setAnalysisResult(analysisDTO.getAnalysisResult());
        analysis.setConfidenceScore(analysisDTO.getConfidenceScore());
        analysis.setRecommendations(analysisDTO.getRecommendations());
        analysis.setModelVersion(analysisDTO.getModelVersion());
        analysis.setStatus(analysisDTO.getStatus());

        AIAnalysis updatedAnalysis = aiAnalysisRepository.save(analysis);
        return convertToDTO(updatedAnalysis);
    }

    public void deleteAIAnalysis(Long id) {
        if (!aiAnalysisRepository.existsById(id)) {
            throw new ResourceNotFoundException("AIAnalysis", id);
        }
        aiAnalysisRepository.deleteById(id);
    }

    private StructuredAnalysisReport parseStructuredReport(String jsonResponse) {
        if (jsonResponse == null || jsonResponse.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Clean the response - remove markdown code blocks if present
            String cleanedJson = jsonResponse.trim();
            if (cleanedJson.startsWith("```json")) {
                cleanedJson = cleanedJson.substring(7);
            }
            if (cleanedJson.startsWith("```")) {
                cleanedJson = cleanedJson.substring(3);
            }
            if (cleanedJson.endsWith("```")) {
                cleanedJson = cleanedJson.substring(0, cleanedJson.length() - 3);
            }
            cleanedJson = cleanedJson.trim();
            
            // Check if this is a question-only response (for voice consultation)
            // Look for question-only patterns before attempting to parse
            if (cleanedJson.contains("\"question\"") || cleanedJson.contains("\"followUpQuestion\"")) {
                // Check if it has structured report fields
                boolean hasStructuredFields = cleanedJson.contains("\"primaryClinicalSummary\"") ||
                                            cleanedJson.contains("\"riskAssessment\"") ||
                                            cleanedJson.contains("\"diseaseStage\"");
                
                if (!hasStructuredFields) {
                    // This is a question response, not a full structured report
                    System.out.println("Received question-only JSON, skipping structured report parsing");
                    return null;
                }
            }
            
            // Try to parse as StructuredAnalysisReport (already configured to ignore unknown properties)
            StructuredAnalysisReport report = objectMapper.readValue(cleanedJson, StructuredAnalysisReport.class);
            
            // Verify it's a valid structured report (has at least one main field)
            if (report.getPrimaryClinicalSummary() == null && 
                report.getPrimaryClinicalImpression() == null &&
                report.getRiskAssessment() == null) {
                System.out.println("Parsed JSON but missing structured report fields, treating as non-structured");
                return null;
            }
            
            return report;
        } catch (com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException e) {
            // This is likely a question-only or different format JSON
            System.out.println("Unrecognized JSON format (likely question-only): " + e.getPropertyName());
            return null;
        } catch (com.fasterxml.jackson.core.JsonParseException e) {
            // Not valid JSON at all
            System.err.println("Invalid JSON format: " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.err.println("Failed to parse structured report JSON: " + e.getMessage());
            // Check if it's a question-only format
            if (jsonResponse.contains("\"question\"") || jsonResponse.contains("\"followUpQuestion\"")) {
                System.out.println("Question-only response detected, not a structured report");
                return null;
            }
            return null;
        }
    }

    private String formatStructuredReport(StructuredAnalysisReport report) {
        if (report == null) {
            return "Unable to format structured report.";
        }

        StringBuilder formatted = new StringBuilder();

        // 1. PRIMARY CLINICAL SUMMARY
        formatted.append("### 1. PRIMARY CLINICAL SUMMARY\n");
        if (report.getPrimaryClinicalSummary() != null) {
            formatted.append(report.getPrimaryClinicalSummary()).append("\n");
        }
        formatted.append("\n---\n\n");

        // 2. PRIMARY CLINICAL IMPRESSION
        formatted.append("### 2. PRIMARY CLINICAL IMPRESSION\n");
        if (report.getPrimaryClinicalImpression() != null) {
            formatted.append(report.getPrimaryClinicalImpression()).append("\n");
        }
        formatted.append("\n---\n\n");

        // 3. DISEASE STAGE CLASSIFICATION
        formatted.append("### 3. DISEASE STAGE CLASSIFICATION\n");
        if (report.getDiseaseStage() != null) {
            formatted.append("- Stage: ").append(report.getDiseaseStage().getStage()).append("\n");
            if (report.getDiseaseStage().getExplanation() != null) {
                for (String explanation : report.getDiseaseStage().getExplanation()) {
                    formatted.append("- ").append(explanation).append("\n");
                }
            }
        }
        formatted.append("\n---\n\n");

        // 4. RISK ASSESSMENT
        formatted.append("### 4. RISK ASSESSMENT\n");
        if (report.getRiskAssessment() != null) {
            formatted.append("- Overall Risk Level: ").append(report.getRiskAssessment().getOverallRiskLevel()).append("\n");
            if (report.getRiskAssessment().getRiskOfProgression() != null) {
                formatted.append("- Estimated Risk of Disease Progression: ").append(report.getRiskAssessment().getRiskOfProgression()).append("%\n");
            }
            if (report.getRiskAssessment().getConfidenceScore() != null) {
                formatted.append("- Estimated Confidence Score: ").append(report.getRiskAssessment().getConfidenceScore()).append("%\n");
            }
            if (report.getRiskAssessment().getRiskFactors() != null) {
                formatted.append("\n").append(report.getRiskAssessment().getRiskFactors()).append("\n");
            }
        }
        formatted.append("\n---\n\n");

        // 5. KEY INDICATORS
        formatted.append("### 5. KEY INDICATORS SUPPORTING THIS ASSESSMENT\n");
        if (report.getKeyIndicators() != null && !report.getKeyIndicators().isEmpty()) {
            for (String indicator : report.getKeyIndicators()) {
                formatted.append("- ").append(indicator).append("\n");
            }
        }
        formatted.append("\n---\n\n");

        // 6. DIFFERENTIAL DIAGNOSIS
        formatted.append("### 6. DIFFERENTIAL DIAGNOSIS (RANKED)\n");
        if (report.getDifferentialDiagnosis() != null && !report.getDifferentialDiagnosis().isEmpty()) {
            for (StructuredAnalysisReport.DifferentialDiagnosis dd : report.getDifferentialDiagnosis()) {
                formatted.append("- **").append(dd.getCondition()).append("**\n");
                formatted.append("  - Likelihood: ").append(dd.getLikelihood()).append("\n");
                formatted.append("  - ").append(dd.getJustification()).append("\n");
            }
        }
        formatted.append("\n---\n\n");

        // 7. ACTIONABLE RECOMMENDATIONS
        formatted.append("### 7. ACTIONABLE RECOMMENDATIONS\n\n");
        if (report.getRecommendations() != null) {
            formatted.append("**Immediate Actions**\n");
            if (report.getRecommendations().getImmediateActions() != null) {
                for (String action : report.getRecommendations().getImmediateActions()) {
                    formatted.append("- ").append(action).append("\n");
                }
            }
            formatted.append("\n**Further Diagnostic Evaluation**\n");
            if (report.getRecommendations().getFurtherDiagnosticEvaluation() != null) {
                for (String test : report.getRecommendations().getFurtherDiagnosticEvaluation()) {
                    formatted.append("- ").append(test).append("\n");
                }
            }
            formatted.append("\n**Monitoring & Follow-Up**\n");
            if (report.getRecommendations().getMonitoringAndFollowUp() != null) {
                for (String monitor : report.getRecommendations().getMonitoringAndFollowUp()) {
                    formatted.append("- ").append(monitor).append("\n");
                }
            }
        }
        formatted.append("\n---\n\n");

        // 8. WARNING SIGNS
        formatted.append("### 8. WARNING SIGNS & SAFETY ALERTS\n");
        if (report.getWarningSigns() != null && !report.getWarningSigns().isEmpty()) {
            for (String warning : report.getWarningSigns()) {
                formatted.append("- ").append(warning).append("\n");
            }
        }
        formatted.append("\n---\n\n");

        // 9. UNCERTAINTY & LIMITATIONS
        formatted.append("### 9. UNCERTAINTY & LIMITATIONS\n");
        if (report.getUncertaintyAndLimitations() != null) {
            formatted.append(report.getUncertaintyAndLimitations()).append("\n");
        }
        formatted.append("\n---\n\n");

        // 10. FINAL AI NOTE
        formatted.append("### 10. FINAL AI NOTE\n");
        if (report.getFinalAINote() != null) {
            formatted.append(report.getFinalAINote()).append("\n");
        }

        return formatted.toString();
    }

    private String extractRecommendationsFromText(String text) {
        if (text == null || text.isEmpty()) {
            return "Based on the analysis, follow-up consultation is recommended.";
        }
        
        // Try to extract recommendations section
        String lowerText = text.toLowerCase();
        if (lowerText.contains("recommendation") || lowerText.contains("suggest")) {
            // Extract recommendations section
            int startIdx = Math.max(
                text.toLowerCase().indexOf("recommendation"),
                text.toLowerCase().indexOf("suggest")
            );
            if (startIdx != -1) {
                String recommendations = text.substring(startIdx);
                // Limit length
                if (recommendations.length() > 500) {
                    recommendations = recommendations.substring(0, 500) + "...";
                }
                return recommendations;
            }
        }
        
        // Fallback: return a summary
        if (text.length() > 300) {
            return text.substring(0, 300) + "... (See full analysis for details)";
        }
        return text;
    }
    
    private String extractConfidenceFromText(String text) {
        if (text == null || text.isEmpty()) {
            return "65%";
        }
        
        // Try to extract confidence score
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "(?:confidence|confidence score)[:\\s]+(\\d+)%?", 
            java.util.regex.Pattern.CASE_INSENSITIVE
        );
        java.util.regex.Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1) + "%";
        }
        
        // Fallback to length-based calculation
        return calculateConfidenceScore(text);
    }

    private String formatRecommendations(StructuredAnalysisReport report) {
        if (report == null || report.getRecommendations() == null) {
            return "Based on the analysis, follow-up consultation is recommended.";
        }

        StringBuilder recommendations = new StringBuilder();
        recommendations.append("**Immediate Actions:**\n");
        if (report.getRecommendations().getImmediateActions() != null) {
            for (String action : report.getRecommendations().getImmediateActions()) {
                recommendations.append("- ").append(action).append("\n");
            }
        }
        recommendations.append("\n**Further Diagnostic Evaluation:**\n");
        if (report.getRecommendations().getFurtherDiagnosticEvaluation() != null) {
            for (String test : report.getRecommendations().getFurtherDiagnosticEvaluation()) {
                recommendations.append("- ").append(test).append("\n");
            }
        }
        recommendations.append("\n**Monitoring & Follow-Up:**\n");
        if (report.getRecommendations().getMonitoringAndFollowUp() != null) {
            for (String monitor : report.getRecommendations().getMonitoringAndFollowUp()) {
                recommendations.append("- ").append(monitor).append("\n");
            }
        }

        return recommendations.toString();
    }

    private AIAnalysisDTO convertToDTO(AIAnalysis analysis) {
        AIAnalysisDTO dto = new AIAnalysisDTO();
        BeanUtils.copyProperties(analysis, dto);
        dto.setPatientId(analysis.getPatient().getId());
        dto.setPatientName(analysis.getPatient().getFirstName() + " " + analysis.getPatient().getLastName());
        if (analysis.getMedicalRecord() != null) {
            dto.setMedicalRecordId(analysis.getMedicalRecord().getId());
        }
        dto.setStructuredReportJson(analysis.getStructuredReportJson());
        return dto;
    }
}

