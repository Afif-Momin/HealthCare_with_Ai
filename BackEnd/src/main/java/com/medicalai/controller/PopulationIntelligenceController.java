package com.medicalai.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.medicalai.service.PopulationIntelligenceService;

import java.util.Map;

@RestController
@RequestMapping("/api/population-intelligence")
public class PopulationIntelligenceController {

    @Autowired
    private PopulationIntelligenceService populationIntelligenceService;

    @GetMapping("/analyze-all")
    public ResponseEntity<Map<String, Object>> analyzeAllPatients() {
        Map<String, Object> populationData = populationIntelligenceService.analyzeAllPatients();
        return ResponseEntity.ok(populationData);
    }
}


