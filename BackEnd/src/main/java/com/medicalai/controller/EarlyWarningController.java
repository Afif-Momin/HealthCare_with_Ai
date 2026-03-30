package com.medicalai.controller;

import com.medicalai.service.EarlyWarningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/early-warning")
@CrossOrigin(origins = "*")
public class EarlyWarningController {

    @Autowired
    private EarlyWarningService earlyWarningService;

    @GetMapping("/detect")
    public ResponseEntity<Map<String, Object>> detectOutbreakPatterns(
            @RequestParam(required = false, defaultValue = "Global") String region,
            @RequestParam(required = false, defaultValue = "30 days") String timePeriod) {
        Map<String, Object> result = earlyWarningService.detectOutbreakPatterns(region, timePeriod);
        return ResponseEntity.ok(result);
    }
}

