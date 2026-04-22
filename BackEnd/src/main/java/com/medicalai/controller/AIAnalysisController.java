package com.medicalai.controller;

import com.medicalai.dto.AIAnalysisDTO;
import com.medicalai.dto.AIAnalysisRequest;
import com.medicalai.service.AIAnalysisService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-analysis")
public class AIAnalysisController {

    @Autowired
    private AIAnalysisService aiAnalysisService;

    @PostMapping
    public ResponseEntity<AIAnalysisDTO> createAIAnalysis(@Valid @RequestBody AIAnalysisRequest request) {
        AIAnalysisDTO analysis = aiAnalysisService.createAIAnalysis(request);
        return new ResponseEntity<>(analysis, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIAnalysisDTO> getAIAnalysisById(@PathVariable Long id) {
        AIAnalysisDTO analysis = aiAnalysisService.getAIAnalysisById(id);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping
    public ResponseEntity<List<AIAnalysisDTO>> getAllAIAnalyses(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String analysisType) {
        List<AIAnalysisDTO> analyses;
        if (patientId != null) {
            analyses = aiAnalysisService.getAIAnalysesByPatientId(patientId);
        } else if (analysisType != null) {
            analyses = aiAnalysisService.getAIAnalysesByType(analysisType);
        } else {
            analyses = aiAnalysisService.getAllAIAnalyses();
        }
        return ResponseEntity.ok(analyses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AIAnalysisDTO> updateAIAnalysis(
            @PathVariable Long id,
            @Valid @RequestBody AIAnalysisDTO analysisDTO) {
        AIAnalysisDTO updatedAnalysis = aiAnalysisService.updateAIAnalysis(id, analysisDTO);
        return ResponseEntity.ok(updatedAnalysis);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAIAnalysis(@PathVariable Long id) {
        aiAnalysisService.deleteAIAnalysis(id);
        return ResponseEntity.noContent().build();
    }
}

