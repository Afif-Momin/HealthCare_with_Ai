package com.medicalai.service;

import com.medicalai.entity.AIAnalysis;
import com.medicalai.entity.Patient;
import com.medicalai.repository.AIAnalysisRepository;
import com.medicalai.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class WhatIfSimulatorService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;

    @Autowired
    private GeminiService geminiService;

    public Map<String, Object> simulateScenario(Long patientId, String scenarioType, Map<String, Object> parameters) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Get latest analysis
        Optional<AIAnalysis> latestAnalysisOpt = aiAnalysisRepository.findTopByPatientIdOrderByCreatedAtDesc(patientId);
        AIAnalysis latestAnalysis = latestAnalysisOpt.orElse(null);

        if (latestAnalysis == null) {
            throw new RuntimeException("No analysis found for patient");
        }

        // Build scenario prompt
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a medical AI simulator. Analyze the following 'what-if' scenario:\n\n");
        prompt.append("Patient: ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("\n");
        prompt.append("Current Analysis: ").append(latestAnalysis.getAnalysisType()).append("\n");
        prompt.append("Current Risk/Status: ").append(latestAnalysis.getConfidenceScore()).append("\n\n");
        
        prompt.append("SCENARIO TYPE: ").append(scenarioType).append("\n");
        prompt.append("PARAMETERS:\n");
        parameters.forEach((key, value) -> {
            prompt.append("- ").append(key).append(": ").append(value).append("\n");
        });
        
        prompt.append("\nAnalyze how this scenario would affect the patient's health outcomes. ");
        prompt.append("Provide:\n");
        prompt.append("1. Risk change (increase/decrease percentage)\n");
        prompt.append("2. Expected outcomes\n");
        prompt.append("3. Timeline of changes\n");
        prompt.append("4. Recommendations\n");
        prompt.append("5. Confidence in prediction\n\n");
        prompt.append("Format as JSON with keys: riskChange, outcomes, timeline, recommendations, confidence");

        try {
            String aiResponse = geminiService.generateContent(prompt.toString(), "What-If Simulation");
            
            Map<String, Object> result = new HashMap<>();
            result.put("scenarioType", scenarioType);
            result.put("parameters", parameters);
            result.put("currentAnalysis", Map.of(
                    "type", latestAnalysis.getAnalysisType(),
                    "confidenceScore", latestAnalysis.getConfidenceScore()
            ));
            result.put("simulationResult", aiResponse);
            result.put("patientId", patientId);
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to simulate scenario: " + e.getMessage());
        }
    }
}

