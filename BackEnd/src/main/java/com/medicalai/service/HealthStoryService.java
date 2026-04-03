package com.medicalai.service;

import com.medicalai.entity.AIAnalysis;
import com.medicalai.entity.MedicalRecord;
import com.medicalai.entity.Patient;
import com.medicalai.repository.AIAnalysisRepository;
import com.medicalai.repository.MedicalRecordRepository;
import com.medicalai.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HealthStoryService {

    // Simple in-memory cache: PatientId -> {Story, Timestamp}
    private static final java.util.concurrent.ConcurrentHashMap<Long, CachedStory> cache = new java.util.concurrent.ConcurrentHashMap<>();
    private static final long CACHE_DURATION_MS = 5 * 60 * 60 * 1000; // 5 hours

    private static class CachedStory {
        Map<String, Object> story;
        long timestamp;

        CachedStory(Map<String, Object> story, long timestamp) {
            this.story = story;
            this.timestamp = timestamp;
        }
    }

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;

    @Autowired
    private GeminiService geminiService;

    public Map<String, Object> generateHealthStory(Long patientId) {
        // Check cache first
        CachedStory cached = cache.get(patientId);
        if (cached != null && (System.currentTimeMillis() - cached.timestamp) < CACHE_DURATION_MS) {
            System.out.println("Returning cached health story for patient " + patientId);
            return cached.story;
        }

        System.out.println("Generating new health story for patient " + patientId);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByRecordDateAsc(patientId);
        List<AIAnalysis> analyses = aiAnalysisRepository.findByPatientIdOrderByCreatedAtAsc(patientId);

        // Build timeline
        List<Map<String, Object>> timeline = new ArrayList<>();

        // Add medical records to timeline
        for (MedicalRecord record : records) {
            Map<String, Object> event = new HashMap<>();
            event.put("type", "medical_record");
            event.put("date", record.getRecordDate());
            event.put("title", record.getTitle());
            event.put("description", record.getDescription());
            event.put("recordType", record.getRecordType());
            event.put("diagnosis", record.getDiagnosis());
            event.put("symptoms", record.getSymptoms());
            timeline.add(event);
        }

        // Add AI analyses to timeline
        for (AIAnalysis analysis : analyses) {
            Map<String, Object> event = new HashMap<>();
            event.put("type", "ai_analysis");
            event.put("date", analysis.getCreatedAt());
            event.put("title", analysis.getAnalysisType());
            event.put("description", analysis.getAnalysisResult());
            event.put("confidenceScore", analysis.getConfidenceScore());
            event.put("riskLevel", determineRiskLevel(analysis.getConfidenceScore()));
            timeline.add(event);
        }

        // Sort timeline by date
        timeline.sort(Comparator.comparing(e -> (LocalDateTime) e.get("date")));

        // Generate narrative using AI
        String narrative = generateNarrative(patient, timeline);

        Map<String, Object> healthStory = new HashMap<>();
        healthStory.put("patient", Map.of(
                "id", patient.getId(),
                "name", patient.getFirstName() + " " + patient.getLastName(),
                "dateOfBirth", patient.getDateOfBirth()
        ));
        healthStory.put("timeline", timeline);
        healthStory.put("narrative", narrative);
        healthStory.put("summary", generateSummary(timeline));
        healthStory.put("keyEvents", extractKeyEvents(timeline));

        // Update cache
        cache.put(patientId, new CachedStory(healthStory, System.currentTimeMillis()));

        return healthStory;
    }

    private String determineRiskLevel(String confidenceScore) {
        if (confidenceScore == null) return "UNKNOWN";
        try {
            int score = Integer.parseInt(confidenceScore.replace("%", "").trim());
            if (score >= 70) return "HIGH";
            if (score >= 40) return "MODERATE";
            return "LOW";
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }

    private String generateNarrative(Patient patient, List<Map<String, Object>> timeline) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Create a patient health story narrative based on the following timeline:\n\n");
        prompt.append("Patient: ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("\n");
        prompt.append("Date of Birth: ").append(patient.getDateOfBirth()).append("\n\n");
        prompt.append("Timeline Events:\n");
        
        for (int i = 0; i < timeline.size(); i++) {
            Map<String, Object> event = timeline.get(i);
            prompt.append((i + 1)).append(". ").append(event.get("date")).append(" - ");
            prompt.append(event.get("title")).append("\n");
            if (event.get("description") != null) {
                prompt.append("   ").append(event.get("description")).append("\n");
            }
        }
        
        prompt.append("\nCreate a compelling, human-readable health story that explains the patient's journey over time. ");
        prompt.append("Make it personal, clear, and easy to understand. Format it as a narrative story.");

        try {
            return geminiService.generateContent(prompt.toString(), "Health Story");
        } catch (Exception e) {
            return "Unable to generate narrative at this time.";
        }
    }

    private Map<String, Object> generateSummary(List<Map<String, Object>> timeline) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEvents", timeline.size());
        summary.put("medicalRecords", timeline.stream().filter(e -> "medical_record".equals(e.get("type"))).count());
        summary.put("aiAnalyses", timeline.stream().filter(e -> "ai_analysis".equals(e.get("type"))).count());
        
        if (!timeline.isEmpty()) {
            summary.put("firstEvent", timeline.get(0).get("date"));
            summary.put("lastEvent", timeline.get(timeline.size() - 1).get("date"));
        }
        
        return summary;
    }

    private List<Map<String, Object>> extractKeyEvents(List<Map<String, Object>> timeline) {
        return timeline.stream()
                .filter(e -> {
                    String type = (String) e.get("type");
                    if ("ai_analysis".equals(type)) {
                        String riskLevel = (String) e.get("riskLevel");
                        return "HIGH".equals(riskLevel);
                    }
                    return "medical_record".equals(type) && 
                           (e.get("diagnosis") != null || e.get("symptoms") != null);
                })
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * RAG-style Question Answering for Patient Data
     * 
     * Retrieves all patient context (demographics, records, analyses) and
     * uses Gemini AI to generate an answer to the doctor's question.
     * 
     * @param patientId The patient ID
     * @param question The doctor's question
     * @return A map containing the answer and metadata
     */
    public Map<String, Object> answerPatientQuestion(Long patientId, String question) {
        long startTime = System.currentTimeMillis();
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. Retrieve patient data (RAG: Retrieval step)
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            
            List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByRecordDateAsc(patientId);
            List<AIAnalysis> analyses = aiAnalysisRepository.findByPatientIdOrderByCreatedAtAsc(patientId);
            
            // 2. Build comprehensive context
            StringBuilder context = new StringBuilder();
            context.append("=== PATIENT INFORMATION ===\n");
            context.append("Name: ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("\n");
            if (patient.getDateOfBirth() != null) {
                int age = java.time.LocalDate.now().getYear() - patient.getDateOfBirth().getYear();
                context.append("Age: ").append(age).append(" years\n");
                context.append("Date of Birth: ").append(patient.getDateOfBirth()).append("\n");
            }
            if (patient.getGender() != null) context.append("Gender: ").append(patient.getGender()).append("\n");
            if (patient.getBloodGroup() != null) context.append("Blood Group: ").append(patient.getBloodGroup()).append("\n");
            if (patient.getHeight() != null) context.append("Height: ").append(patient.getHeight()).append(" cm\n");
            if (patient.getWeight() != null) context.append("Weight: ").append(patient.getWeight()).append(" kg\n");
            if (patient.getSystolicBP() != null && patient.getDiastolicBP() != null) {
                context.append("Blood Pressure: ").append(patient.getSystolicBP()).append("/").append(patient.getDiastolicBP()).append(" mmHg\n");
            }
            if (patient.getAllergies() != null && !patient.getAllergies().isEmpty()) {
                context.append("Allergies: ").append(patient.getAllergies()).append("\n");
            }
            if (patient.getMedicalHistory() != null && !patient.getMedicalHistory().isEmpty()) {
                context.append("Medical History: ").append(patient.getMedicalHistory()).append("\n");
            }
            if (patient.getOtherMedications() != null && !patient.getOtherMedications().isEmpty()) {
                context.append("Current Medications: ").append(patient.getOtherMedications()).append("\n");
            }
            if (patient.getDiabetic() != null && patient.getDiabetic()) {
                context.append("Diabetic: Yes").append(patient.getDiabetesType() != null ? " (" + patient.getDiabetesType() + ")" : "").append("\n");
            }
            if (patient.getSmoker() != null && patient.getSmoker()) context.append("Smoker: Yes\n");
            if (patient.getRestingHeartRate() != null) context.append("Resting Heart Rate: ").append(patient.getRestingHeartRate()).append(" bpm\n");
            if (patient.getTotalCholesterol() != null) context.append("Total Cholesterol: ").append(patient.getTotalCholesterol()).append(" mg/dL\n");
            if (patient.getFastingGlucose() != null) context.append("Fasting Glucose: ").append(patient.getFastingGlucose()).append(" mg/dL\n");
            
            // Add medical records
            if (!records.isEmpty()) {
                context.append("\n=== MEDICAL RECORDS (").append(records.size()).append(" total) ===\n");
                int count = 0;
                for (MedicalRecord record : records) {
                    if (count++ >= 10) {
                        context.append("... and ").append(records.size() - 10).append(" more records\n");
                        break;
                    }
                    context.append("\n[").append(record.getRecordDate()).append("] ");
                    context.append(record.getTitle() != null ? record.getTitle() : record.getRecordType()).append("\n");
                    if (record.getDiagnosis() != null) context.append("  Diagnosis: ").append(record.getDiagnosis()).append("\n");
                    if (record.getSymptoms() != null) context.append("  Symptoms: ").append(record.getSymptoms()).append("\n");
                    if (record.getDescription() != null) {
                        String desc = record.getDescription();
                        if (desc.length() > 200) desc = desc.substring(0, 200) + "...";
                        context.append("  Description: ").append(desc).append("\n");
                    }
                }
            }
            
            // Add AI analyses
            if (!analyses.isEmpty()) {
                context.append("\n=== AI ANALYSES (").append(analyses.size()).append(" total) ===\n");
                int count = 0;
                for (AIAnalysis analysis : analyses) {
                    if (count++ >= 10) {
                        context.append("... and ").append(analyses.size() - 10).append(" more analyses\n");
                        break;
                    }
                    context.append("\n[").append(analysis.getCreatedAt()).append("] ");
                    context.append(analysis.getAnalysisType()).append("\n");
                    if (analysis.getConfidenceScore() != null) {
                        context.append("  Confidence: ").append(analysis.getConfidenceScore()).append("\n");
                        String risk = determineRiskLevel(analysis.getConfidenceScore());
                        context.append("  Risk Level: ").append(risk).append("\n");
                    }
                    if (analysis.getAnalysisResult() != null) {
                        String analysisResult = analysis.getAnalysisResult();
                        if (analysisResult.length() > 300) analysisResult = analysisResult.substring(0, 300) + "...";
                        context.append("  Result: ").append(analysisResult).append("\n");
                    }
                    if (analysis.getRecommendations() != null) {
                        String recs = analysis.getRecommendations();
                        if (recs.length() > 200) recs = recs.substring(0, 200) + "...";
                        context.append("  Recommendations: ").append(recs).append("\n");
                    }
                }
            }
            
            // 3. Build the RAG prompt
            StringBuilder prompt = new StringBuilder();
            prompt.append("You are a medical AI assistant helping a doctor review a patient's health information.\n\n");
            prompt.append("PATIENT CONTEXT:\n");
            prompt.append(context.toString());
            prompt.append("\n\n=== DOCTOR'S QUESTION ===\n");
            prompt.append(question);
            prompt.append("\n\n=== YOUR TASK ===\n");
            prompt.append("Answer the doctor's question based on the patient's data above. Be:\n");
            prompt.append("1. Accurate - only mention information that exists in the patient's records\n");
            prompt.append("2. Concise - get to the point quickly\n");
            prompt.append("3. Clinical - use medical terminology appropriately\n");
            prompt.append("4. Helpful - suggest relevant follow-ups if appropriate\n");
            prompt.append("5. Safe - note any missing information that would be helpful\n\n");
            prompt.append("If the question cannot be answered from the available data, clearly state what information is missing.\n");
            prompt.append("Format your response in clear paragraphs. Do not use markdown.");
            
            // 4. Generate answer using Gemini (RAG: Generation step)
            String answer = geminiService.generateContent(prompt.toString(), "Patient Q&A");
            
            long duration = System.currentTimeMillis() - startTime;
            
            // 5. Build response
            result.put("success", true);
            result.put("answer", answer);
            result.put("question", question);
            result.put("patientId", patientId);
            result.put("patientName", patient.getFirstName() + " " + patient.getLastName());
            result.put("sourcesUsed", Map.of(
                "medicalRecords", records.size(),
                "aiAnalyses", analyses.size()
            ));
            result.put("responseTimeMs", duration);
            result.put("timestamp", LocalDateTime.now().toString());
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Failed to generate answer: " + e.getMessage());
            result.put("question", question);
        }
        
        return result;
    }
}


