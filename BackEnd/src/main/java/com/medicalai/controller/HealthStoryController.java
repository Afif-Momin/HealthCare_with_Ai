package com.medicalai.controller;

import com.medicalai.service.HealthStoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/health-story")
@CrossOrigin(origins = "*")
public class HealthStoryController {

    @Autowired
    private HealthStoryService healthStoryService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Map<String, Object>> getHealthStory(@PathVariable Long patientId) {
        Map<String, Object> healthStory = healthStoryService.generateHealthStory(patientId);
        return ResponseEntity.ok(healthStory);
    }

    /**
     * RAG Q&A Endpoint - Ask questions about a patient's health
     * 
     * Doctors can ask natural language questions and get AI-powered answers
     * based on the patient's medical records, AI analyses, and health data.
     * 
     * @param patientId The patient ID
     * @param request Contains the question to ask
     * @return AI-generated answer with sources
     */
    @PostMapping("/patient/{patientId}/ask")
    public ResponseEntity<Map<String, Object>> askQuestion(
            @PathVariable Long patientId,
            @RequestBody Map<String, String> request) {
        
        String question = request.get("question");
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Question is required",
                "success", false
            ));
        }
        
        Map<String, Object> answer = healthStoryService.answerPatientQuestion(patientId, question.trim());
        return ResponseEntity.ok(answer);
    }
}
