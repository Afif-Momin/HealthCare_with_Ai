package com.medicalai.controller;

import com.medicalai.service.DigitalTwinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/digital-twin")
@CrossOrigin(origins = "*")
public class DigitalTwinController {

    @Autowired
    private DigitalTwinService digitalTwinService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Map<String, Object>> getDigitalTwin(@PathVariable Long patientId) {
        Map<String, Object> digitalTwin = digitalTwinService.generateDigitalTwin(patientId);
        return ResponseEntity.ok(digitalTwin);
    }
}

