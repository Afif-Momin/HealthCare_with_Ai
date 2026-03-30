package com.medicalai.controller;

import com.medicalai.service.HospitalConnectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "*")
public class HospitalConnectorController {

    @Autowired
    private HospitalConnectorService hospitalConnectorService;

    @GetMapping("/nearest/{patientId}")
    public ResponseEntity<Map<String, Object>> findNearestHospitals(
            @PathVariable Long patientId,
            @RequestParam(required = false) String analysisType,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        String type = analysisType != null ? analysisType : "General Analysis";
        Map<String, Object> hospitals = hospitalConnectorService.findNearestHospitals(patientId, type, latitude, longitude);
        return ResponseEntity.ok(hospitals);
    }
    
    @PostMapping("/send-profile/{patientId}")
    public ResponseEntity<Map<String, Object>> sendPatientProfile(
            @PathVariable Long patientId,
            @RequestParam String hospitalEmail,
            @RequestParam(defaultValue = "false") boolean isEmergency) {
        try {
            hospitalConnectorService.sendPatientProfileToHospital(patientId, hospitalEmail, isEmergency);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", isEmergency ? 
                "Emergency request sent to hospital successfully" : 
                "Patient profile sent to hospital successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send profile: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}


