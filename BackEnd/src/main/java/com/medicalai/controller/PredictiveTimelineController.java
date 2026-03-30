package com.medicalai.controller;

import com.medicalai.service.PredictiveTimelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/predictive-timeline")
@CrossOrigin(origins = "*")
public class PredictiveTimelineController {

    @Autowired
    private PredictiveTimelineService predictiveTimelineService;

    /**
     * Generate a predictive health timeline for a patient
     * 
     * @param patientId The patient ID
     * @param healthInputs Health parameters including:
     *   - systolicBP: Systolic blood pressure (default 120)
     *   - totalCholesterol: Total cholesterol in mg/dL (default 200)
     *   - hdlCholesterol: HDL cholesterol in mg/dL (default 50)
     *   - smoker: Whether patient smokes (default false)
     *   - diabetic: Whether patient has diabetes (default false)
     *   - onBPMeds: Whether on blood pressure medication (default false)
     *   - exerciseHoursPerWeek: Hours of exercise per week (default 2)
     *   - diet: Diet quality - "poor", "average", "healthy", "mediterranean" (default "average")
     *   - familyHistoryHeartDisease: Family history of heart disease (default false)
     *   - familyHistoryDiabetes: Family history of diabetes (default false)
     *   - bmi: Body Mass Index (default 25.0)
     * @return Predictive timeline data including trajectories, risk scores, and interventions
     */
    @PostMapping("/patient/{patientId}")
    public ResponseEntity<Map<String, Object>> generatePredictiveTimeline(
            @PathVariable Long patientId,
            @RequestBody Map<String, Object> healthInputs) {
        Map<String, Object> timeline = predictiveTimelineService.generatePredictiveTimeline(patientId, healthInputs);
        return ResponseEntity.ok(timeline);
    }

    /**
     * Get predictive timeline with default values (for quick preview)
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Map<String, Object>> getPredictiveTimelineWithDefaults(
            @PathVariable Long patientId) {
        Map<String, Object> defaultInputs = new HashMap<>();
        defaultInputs.put("systolicBP", 120);
        defaultInputs.put("totalCholesterol", 200);
        defaultInputs.put("hdlCholesterol", 50);
        defaultInputs.put("smoker", false);
        defaultInputs.put("diabetic", false);
        defaultInputs.put("onBPMeds", false);
        defaultInputs.put("exerciseHoursPerWeek", 2);
        defaultInputs.put("diet", "average");
        defaultInputs.put("familyHistoryHeartDisease", false);
        defaultInputs.put("familyHistoryDiabetes", false);
        defaultInputs.put("bmi", 25.0);
        
        Map<String, Object> timeline = predictiveTimelineService.generatePredictiveTimeline(patientId, defaultInputs);
        return ResponseEntity.ok(timeline);
    }
    
    /**
     * What-If scenario analysis - See how lifestyle changes affect health trajectory
     * 
     * @param patientId The patient ID
     * @param scenarioInputs Modified health parameters to simulate
     * @return Comparison of current vs modified trajectory
     */
    @PostMapping("/patient/{patientId}/what-if")
    public ResponseEntity<Map<String, Object>> calculateWhatIfScenario(
            @PathVariable Long patientId,
            @RequestBody Map<String, Object> scenarioInputs) {
        Map<String, Object> whatIfResult = predictiveTimelineService.calculateWhatIfScenario(patientId, scenarioInputs);
        return ResponseEntity.ok(whatIfResult);
    }
    
    /**
     * Get available interventions and their potential impact
     */
    @GetMapping("/interventions")
    public ResponseEntity<Map<String, Object>> getAvailableInterventions() {
        Map<String, Object> interventions = new HashMap<>();
        interventions.put("exerciseInterventions", new Object[]{
            createIntervention("Light Exercise", "30 min walking 3x/week", 1, "Low"),
            createIntervention("Moderate Exercise", "150 min moderate activity/week", 3, "Medium"),
            createIntervention("Intense Exercise", "300+ min vigorous activity/week", 5, "High")
        });
        interventions.put("dietInterventions", new Object[]{
            createIntervention("Healthy Diet", "Reduce processed foods, increase vegetables", 2, "Medium"),
            createIntervention("Mediterranean Diet", "Heart-healthy Mediterranean eating pattern", 4, "Medium"),
            createIntervention("DASH Diet", "Dietary approach to stop hypertension", 3, "Medium")
        });
        interventions.put("lifestyleInterventions", new Object[]{
            createIntervention("Quit Smoking", "Complete smoking cessation", 7, "High"),
            createIntervention("Weight Loss", "Achieve healthy BMI (18.5-24.9)", 4, "Medium"),
            createIntervention("Stress Management", "Regular meditation/relaxation practices", 2, "Low"),
            createIntervention("Sleep Optimization", "7-9 hours quality sleep nightly", 2, "Low")
        });
        interventions.put("medicalInterventions", new Object[]{
            createIntervention("BP Control", "Maintain BP below 120/80", 3, "Low"),
            createIntervention("Cholesterol Management", "Statins if indicated", 3, "Low"),
            createIntervention("Regular Screenings", "Annual checkups and age-appropriate screenings", 2, "Low")
        });
        return ResponseEntity.ok(interventions);
    }
    
    private Map<String, Object> createIntervention(String name, String description, int lifeYearsGained, String difficulty) {
        Map<String, Object> intervention = new HashMap<>();
        intervention.put("name", name);
        intervention.put("description", description);
        intervention.put("lifeYearsGained", lifeYearsGained);
        intervention.put("difficulty", difficulty);
        return intervention;
    }
}

