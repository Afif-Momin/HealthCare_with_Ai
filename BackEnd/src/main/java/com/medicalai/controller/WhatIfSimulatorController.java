package com.medicalai.controller;

import com.medicalai.service.WhatIfSimulatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/what-if")
public class WhatIfSimulatorController {

    @Autowired
    private WhatIfSimulatorService whatIfSimulatorService;

    @PostMapping("/patient/{patientId}/simulate")
    public ResponseEntity<Map<String, Object>> simulateScenario(
            @PathVariable Long patientId,
            @RequestParam String scenarioType,
            @RequestBody Map<String, Object> parameters) {
        Map<String, Object> result = whatIfSimulatorService.simulateScenario(patientId, scenarioType, parameters);
        return ResponseEntity.ok(result);
    }
}


