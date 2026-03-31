package com.medicalai.service;

import com.medicalai.entity.MedicalRecord;
import com.medicalai.entity.Patient;
import com.medicalai.repository.MedicalRecordRepository;
import com.medicalai.repository.PatientRepository;
import com.medicalai.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Personal Medical Digital Twin Service
 * Creates a continuously updating AI health twin for each patient
 */
@Service
@Transactional
public class DigitalTwinService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private GeminiService geminiService;

    /**
     * Generate comprehensive digital twin analysis for a patient
     */
    public Map<String, Object> generateDigitalTwin(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));

        // Get all medical records for the patient
        List<MedicalRecord> records = medicalRecordRepository.findByPatientId(patientId);

        // Build comprehensive health profile
        StringBuilder healthProfile = new StringBuilder();
        healthProfile.append("PATIENT DIGITAL TWIN - COMPREHENSIVE HEALTH PROFILE\n\n");
        healthProfile.append("Patient: ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("\n");
        healthProfile.append("Age: ").append(calculateAge(patient.getDateOfBirth())).append(" years\n");
        healthProfile.append("Gender: ").append(patient.getGender()).append("\n\n");
        
        healthProfile.append("MEDICAL HISTORY SUMMARY:\n");
        healthProfile.append("Total Records: ").append(records.size()).append("\n\n");

        // Group records by type
        Map<String, List<MedicalRecord>> recordsByType = records.stream()
                .collect(Collectors.groupingBy(MedicalRecord::getRecordType));

        recordsByType.forEach((type, typeRecords) -> {
            healthProfile.append(type).append(" (").append(typeRecords.size()).append(" records):\n");
            typeRecords.forEach(record -> {
                healthProfile.append("  - ").append(record.getTitle()).append(" (").append(record.getRecordDate()).append(")\n");
                if (record.getDiagnosis() != null) {
                    healthProfile.append("    Diagnosis: ").append(record.getDiagnosis()).append("\n");
                }
            });
            healthProfile.append("\n");
        });

        healthProfile.append("\nDIGITAL TWIN ANALYSIS REQUEST:\n");
        healthProfile.append("Analyze this patient's complete health trajectory:\n");
        healthProfile.append("1. Long-term health patterns and trends\n");
        healthProfile.append("2. Predictive risk modeling (5-10 years ahead)\n");
        healthProfile.append("3. Personalized intervention simulations\n");
        healthProfile.append("4. Life-course health optimization recommendations\n");
        healthProfile.append("5. Early warning signs for potential future conditions\n");

        String aiAnalysis = geminiService.generateContent(healthProfile.toString(), "Digital Twin Analysis");

        Map<String, Object> digitalTwin = new HashMap<>();
        digitalTwin.put("patientId", patientId);
        digitalTwin.put("patientName", patient.getFirstName() + " " + patient.getLastName());
        digitalTwin.put("totalRecords", records.size());
        digitalTwin.put("recordsByType", recordsByType.keySet());
        digitalTwin.put("healthProfile", healthProfile.toString());
        digitalTwin.put("aiAnalysis", aiAnalysis);
        digitalTwin.put("lastUpdated", LocalDateTime.now());
        digitalTwin.put("healthScore", calculateHealthScore(records));

        return digitalTwin;
    }

    private int calculateAge(java.time.LocalDate dateOfBirth) {
        if (dateOfBirth == null) return 0;
        return java.time.Period.between(dateOfBirth, java.time.LocalDate.now()).getYears();
    }

    private String calculateHealthScore(List<MedicalRecord> records) {
        // Simple health score based on record count and types
        // In production, this would be more sophisticated
        if (records.isEmpty()) return "N/A - No records";
        int score = 100;
        score -= records.size() * 2; // More records might indicate more health issues
        if (score < 0) score = 0;
        return score + "/100";
    }
}

