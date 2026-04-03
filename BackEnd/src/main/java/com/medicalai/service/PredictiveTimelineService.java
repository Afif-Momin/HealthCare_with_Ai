package com.medicalai.service;

import com.medicalai.entity.Patient;
import com.medicalai.entity.AIAnalysis;
import com.medicalai.entity.MedicalRecord;
import com.medicalai.repository.PatientRepository;
import com.medicalai.repository.AIAnalysisRepository;
import com.medicalai.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;

@Service
public class PredictiveTimelineService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private GeminiService geminiService;

    /**
     * Generate predictive health timeline for a patient
     */
    public Map<String, Object> generatePredictiveTimeline(Long patientId, Map<String, Object> healthInputs) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Calculate current age (use provided age or calculate from DOB)
        int currentAge = getIntValue(healthInputs, "age", calculateAge(patient.getDateOfBirth()));
        boolean isMale = "male".equalsIgnoreCase(getStringValue(healthInputs, "gender", 
            patient.getGender() == Patient.Gender.MALE ? "male" : "female"));

        // Vital Signs & Biomarkers
        int systolicBP = getIntValue(healthInputs, "systolicBP", 120);
        int diastolicBP = getIntValue(healthInputs, "diastolicBP", 80);
        int restingHeartRate = getIntValue(healthInputs, "restingHeartRate", 72);
        int totalCholesterol = getIntValue(healthInputs, "totalCholesterol", 200);
        int ldlCholesterol = getIntValue(healthInputs, "ldlCholesterol", 130);
        int hdlCholesterol = getIntValue(healthInputs, "hdlCholesterol", 50);
        int triglycerides = getIntValue(healthInputs, "triglycerides", 150);
        int fastingGlucose = getIntValue(healthInputs, "fastingGlucose", 95);
        double hba1c = getDoubleValue(healthInputs, "hba1c", 5.5);
        
        // Lifestyle Factors - Smoking
        boolean smoker = getBoolValue(healthInputs, "smoker", false);
        int smokingYears = getIntValue(healthInputs, "smokingYears", 0);
        int cigarettesPerDay = getIntValue(healthInputs, "cigarettesPerDay", 0);
        boolean formerSmoker = getBoolValue(healthInputs, "formerSmoker", false);
        int yearsQuitSmoking = getIntValue(healthInputs, "yearsQuitSmoking", 0);
        
        // Lifestyle Factors - Alcohol
        String alcoholConsumption = getStringValue(healthInputs, "alcoholConsumption", "moderate");
        int drinksPerWeek = getIntValue(healthInputs, "drinksPerWeek", 3);
        
        // Lifestyle Factors - Exercise
        int exerciseHoursPerWeek = getIntValue(healthInputs, "exerciseHoursPerWeek", 2);
        String exerciseIntensity = getStringValue(healthInputs, "exerciseIntensity", "moderate");
        int sedentaryHoursPerDay = getIntValue(healthInputs, "sedentaryHoursPerDay", 8);
        
        // Lifestyle Factors - Diet
        String diet = getStringValue(healthInputs, "diet", "average");
        int dailyVegetableServings = getIntValue(healthInputs, "dailyVegetableServings", 2);
        int dailyFruitServings = getIntValue(healthInputs, "dailyFruitServings", 1);
        String processedFoodFrequency = getStringValue(healthInputs, "processedFoodFrequency", "sometimes");
        
        // Lifestyle Factors - Sleep & Stress
        int sleepHoursPerNight = getIntValue(healthInputs, "sleepHoursPerNight", 7);
        String sleepQuality = getStringValue(healthInputs, "sleepQuality", "fair");
        String stressLevel = getStringValue(healthInputs, "stressLevel", "moderate");
        
        // Medical History
        boolean diabetic = getBoolValue(healthInputs, "diabetic", false);
        String diabetesType = getStringValue(healthInputs, "diabetesType", "none");
        boolean onBPMeds = getBoolValue(healthInputs, "onBPMeds", false);
        boolean onCholesterolMeds = getBoolValue(healthInputs, "onCholesterolMeds", false);
        boolean onDiabetesMeds = getBoolValue(healthInputs, "onDiabetesMeds", false);
        
        // Family History
        boolean familyHistoryHeartDisease = getBoolValue(healthInputs, "familyHistoryHeartDisease", false);
        boolean familyHistoryDiabetes = getBoolValue(healthInputs, "familyHistoryDiabetes", false);
        boolean familyHistoryStroke = getBoolValue(healthInputs, "familyHistoryStroke", false);
        boolean familyHistoryCancer = getBoolValue(healthInputs, "familyHistoryCancer", false);
        boolean familyHistoryHypertension = getBoolValue(healthInputs, "familyHistoryHypertension", false);
        boolean familyHistoryObesity = getBoolValue(healthInputs, "familyHistoryObesity", false);
        
        // Additional Risk Factors
        boolean hasChronicKidneyDisease = getBoolValue(healthInputs, "hasChronicKidneyDisease", false);
        boolean hadHeartAttack = getBoolValue(healthInputs, "hadHeartAttack", false);
        boolean hadStroke = getBoolValue(healthInputs, "hadStroke", false);
        boolean hasArrhythmia = getBoolValue(healthInputs, "hasArrhythmia", false);
        boolean hasAnxiety = getBoolValue(healthInputs, "hasAnxiety", false);
        boolean hasDepression = getBoolValue(healthInputs, "hasDepression", false);
        
        // BMI
        double bmi = getDoubleValue(healthInputs, "bmi", 25.0);
        
        // Calculate pack-years for smokers (important metric)
        double packYears = smoker ? (cigarettesPerDay / 20.0) * smokingYears : 0;

        // Calculate Framingham Risk Score (10-year cardiovascular risk)
        double framinghamRisk = calculateFraminghamRiskScore(
            currentAge, isMale, systolicBP, totalCholesterol, hdlCholesterol, 
            smoker, diabetic, onBPMeds
        );

        // Calculate other disease risks
        double diabetesRisk = calculateDiabetesRisk(currentAge, bmi, familyHistoryDiabetes, exerciseHoursPerWeek, diet);
        double strokeRisk = calculateStrokeRisk(currentAge, systolicBP, smoker, diabetic, familyHistoryHeartDisease);
        double cancerRisk = calculateCancerRisk(currentAge, smoker, bmi, exerciseHoursPerWeek, diet);

        // Generate current trajectory (without interventions)
        List<Map<String, Object>> currentTrajectory = generateTrajectory(
            currentAge, framinghamRisk, diabetesRisk, strokeRisk, cancerRisk,
            smoker, exerciseHoursPerWeek, diet, bmi, "current"
        );

        // Generate improved trajectory (with interventions)
        List<Map<String, Object>> improvedTrajectory = generateTrajectory(
            currentAge, framinghamRisk, diabetesRisk, strokeRisk, cancerRisk,
            false, // quit smoking
            5, // increased exercise
            "mediterranean", // improved diet
            Math.min(bmi, 25.0), // normalized BMI
            "improved"
        );

        // Calculate disease onset probabilities
        List<Map<String, Object>> diseaseOnsetProbabilities = calculateDiseaseOnsetProbabilities(
            currentAge, framinghamRisk, diabetesRisk, strokeRisk, cancerRisk
        );

        // Generate AI-powered insights with comprehensive data
        String aiInsights = generateAIInsights(
            patient, currentAge, framinghamRisk, diabetesRisk, strokeRisk,
            cancerRisk, healthInputs
        );

        // Calculate intervention impacts
        List<Map<String, Object>> interventionImpacts = calculateInterventionImpacts(
            framinghamRisk, diabetesRisk, strokeRisk, cancerRisk,
            smoker, exerciseHoursPerWeek, diet, bmi
        );

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("patientId", patientId);
        response.put("patientName", patient.getFirstName() + " " + patient.getLastName());
        response.put("currentAge", currentAge);
        response.put("gender", isMale ? "Male" : "Female");
        
        // Risk scores
        Map<String, Object> riskScores = new HashMap<>();
        riskScores.put("framingham10Year", Math.round(framinghamRisk * 100) / 100.0);
        riskScores.put("diabetes", Math.round(diabetesRisk * 100) / 100.0);
        riskScores.put("stroke", Math.round(strokeRisk * 100) / 100.0);
        riskScores.put("cancer", Math.round(cancerRisk * 100) / 100.0);
        riskScores.put("overallHealthScore", calculateOverallHealthScore(framinghamRisk, diabetesRisk, strokeRisk, cancerRisk));
        response.put("riskScores", riskScores);
        
        // Trajectories
        response.put("currentTrajectory", currentTrajectory);
        response.put("improvedTrajectory", improvedTrajectory);
        
        // Disease onset probabilities
        response.put("diseaseOnsetProbabilities", diseaseOnsetProbabilities);
        
        // Intervention impacts
        response.put("interventionImpacts", interventionImpacts);
        
        // AI insights
        response.put("aiInsights", aiInsights);
        
        // Health inputs used
        response.put("healthInputs", healthInputs);
        
        response.put("generatedAt", LocalDate.now().toString());

        return response;
    }

    /**
     * Calculate Framingham Risk Score (10-year cardiovascular disease risk)
     * Based on the Framingham Heart Study equations
     */
    private double calculateFraminghamRiskScore(
            int age, boolean male, int systolicBP, int totalCholesterol,
            int hdlCholesterol, boolean smoker, boolean diabetic, boolean onBPMeds) {
        
        double riskScore;
        
        if (male) {
            // Male Framingham equation
            double lnAge = Math.log(age);
            double lnTotalChol = Math.log(totalCholesterol);
            double lnHDL = Math.log(hdlCholesterol);
            double lnBP = Math.log(systolicBP);
            
            double sumCoef = 
                3.06117 * lnAge +
                1.12370 * lnTotalChol +
                -0.93263 * lnHDL +
                (onBPMeds ? 1.99881 * lnBP : 1.93303 * lnBP) +
                (smoker ? 0.65451 : 0) +
                (diabetic ? 0.57367 : 0);
            
            double baselineSurvival = 0.88936;
            double meanCoef = 23.9802;
            
            riskScore = 1 - Math.pow(baselineSurvival, Math.exp(sumCoef - meanCoef));
        } else {
            // Female Framingham equation
            double lnAge = Math.log(age);
            double lnTotalChol = Math.log(totalCholesterol);
            double lnHDL = Math.log(hdlCholesterol);
            double lnBP = Math.log(systolicBP);
            
            double sumCoef = 
                2.32888 * lnAge +
                1.20904 * lnTotalChol +
                -0.70833 * lnHDL +
                (onBPMeds ? 2.82263 * lnBP : 2.76157 * lnBP) +
                (smoker ? 0.52873 : 0) +
                (diabetic ? 0.69154 : 0);
            
            double baselineSurvival = 0.95012;
            double meanCoef = 26.1931;
            
            riskScore = 1 - Math.pow(baselineSurvival, Math.exp(sumCoef - meanCoef));
        }
        
        return Math.max(0, Math.min(100, riskScore * 100));
    }

    /**
     * Calculate diabetes risk based on various factors
     */
    private double calculateDiabetesRisk(int age, double bmi, boolean familyHistory, 
                                          int exerciseHours, String diet) {
        double baseRisk = 5.0; // Base 10-year risk
        
        // Age factor
        if (age > 45) baseRisk += (age - 45) * 0.5;
        
        // BMI factor
        if (bmi > 25) baseRisk += (bmi - 25) * 1.5;
        if (bmi > 30) baseRisk += (bmi - 30) * 2.0;
        
        // Family history
        if (familyHistory) baseRisk *= 2.0;
        
        // Exercise reduction
        baseRisk -= exerciseHours * 1.5;
        
        // Diet factor
        switch (diet.toLowerCase()) {
            case "mediterranean":
            case "healthy":
                baseRisk *= 0.7;
                break;
            case "poor":
            case "unhealthy":
                baseRisk *= 1.5;
                break;
        }
        
        return Math.max(0, Math.min(100, baseRisk));
    }

    /**
     * Calculate stroke risk
     */
    private double calculateStrokeRisk(int age, int systolicBP, boolean smoker, 
                                        boolean diabetic, boolean familyHistory) {
        double baseRisk = 2.0;
        
        // Age factor
        if (age > 55) baseRisk += (age - 55) * 0.8;
        
        // Blood pressure
        if (systolicBP > 120) baseRisk += (systolicBP - 120) * 0.15;
        if (systolicBP > 140) baseRisk += (systolicBP - 140) * 0.3;
        
        // Smoking
        if (smoker) baseRisk *= 2.5;
        
        // Diabetes
        if (diabetic) baseRisk *= 1.8;
        
        // Family history
        if (familyHistory) baseRisk *= 1.5;
        
        return Math.max(0, Math.min(100, baseRisk));
    }

    /**
     * Calculate cancer risk
     */
    private double calculateCancerRisk(int age, boolean smoker, double bmi, 
                                        int exerciseHours, String diet) {
        double baseRisk = 3.0;
        
        // Age factor
        if (age > 40) baseRisk += (age - 40) * 0.3;
        
        // Smoking (major factor)
        if (smoker) baseRisk *= 3.0;
        
        // BMI
        if (bmi > 30) baseRisk *= 1.4;
        
        // Exercise protective effect
        baseRisk -= exerciseHours * 0.8;
        
        // Diet factor
        switch (diet.toLowerCase()) {
            case "mediterranean":
            case "healthy":
                baseRisk *= 0.8;
                break;
            case "poor":
            case "unhealthy":
                baseRisk *= 1.3;
                break;
        }
        
        return Math.max(0, Math.min(100, baseRisk));
    }

    /**
     * Generate health trajectory over time
     */
    private List<Map<String, Object>> generateTrajectory(
            int currentAge, double heartRisk, double diabetesRisk, 
            double strokeRisk, double cancerRisk,
            boolean smoker, int exerciseHours, String diet, double bmi,
            String trajectoryType) {
        
        List<Map<String, Object>> trajectory = new ArrayList<>();
        
        // Project for 50 years or until age 90
        int endAge = Math.min(currentAge + 50, 90);
        
        double currentHeartRisk = heartRisk;
        double currentDiabetesRisk = diabetesRisk;
        double currentStrokeRisk = strokeRisk;
        double currentCancerRisk = cancerRisk;
        
        // Adjustment factors for improved trajectory
        double riskMultiplier = trajectoryType.equals("improved") ? 0.6 : 1.0;
        double yearlyIncrease = trajectoryType.equals("improved") ? 0.3 : 0.8;
        
        for (int age = currentAge; age <= endAge; age += 5) {
            Map<String, Object> point = new HashMap<>();
            point.put("age", age);
            
            // Calculate cumulative risk at this age
            int yearsFromNow = age - currentAge;
            
            double heartCumulative = Math.min(100, currentHeartRisk * riskMultiplier * (1 + yearsFromNow * yearlyIncrease / 10));
            double diabetesCumulative = Math.min(100, currentDiabetesRisk * riskMultiplier * (1 + yearsFromNow * yearlyIncrease / 10));
            double strokeCumulative = Math.min(100, currentStrokeRisk * riskMultiplier * (1 + yearsFromNow * yearlyIncrease / 10));
            double cancerCumulative = Math.min(100, currentCancerRisk * riskMultiplier * (1 + yearsFromNow * yearlyIncrease / 10));
            
            point.put("heartDiseaseRisk", Math.round(heartCumulative * 10) / 10.0);
            point.put("diabetesRisk", Math.round(diabetesCumulative * 10) / 10.0);
            point.put("strokeRisk", Math.round(strokeCumulative * 10) / 10.0);
            point.put("cancerRisk", Math.round(cancerCumulative * 10) / 10.0);
            
            // Overall health score (inverse of average risk)
            double avgRisk = (heartCumulative + diabetesCumulative + strokeCumulative + cancerCumulative) / 4;
            point.put("healthScore", Math.round((100 - avgRisk) * 10) / 10.0);
            
            // Life expectancy estimate
            double lifeExpectancy = calculateLifeExpectancy(age, avgRisk, smoker && trajectoryType.equals("current"));
            point.put("estimatedLifeExpectancy", Math.round(lifeExpectancy * 10) / 10.0);
            
            trajectory.add(point);
        }
        
        return trajectory;
    }

    /**
     * Calculate disease onset probabilities at different ages
     */
    private List<Map<String, Object>> calculateDiseaseOnsetProbabilities(
            int currentAge, double heartRisk, double diabetesRisk, 
            double strokeRisk, double cancerRisk) {
        
        List<Map<String, Object>> probabilities = new ArrayList<>();
        
        // Calculate probability of disease onset at different milestone ages
        int[] milestoneAges = {40, 50, 60, 70, 80};
        
        for (int age : milestoneAges) {
            if (age >= currentAge) {
                int yearsFromNow = age - currentAge;
                Map<String, Object> milestone = new HashMap<>();
                milestone.put("age", age);
                
                // Simplified probability calculation
                milestone.put("heartDisease", Math.min(95, heartRisk * (1 + yearsFromNow * 0.08)));
                milestone.put("diabetes", Math.min(95, diabetesRisk * (1 + yearsFromNow * 0.06)));
                milestone.put("stroke", Math.min(95, strokeRisk * (1 + yearsFromNow * 0.07)));
                milestone.put("cancer", Math.min(95, cancerRisk * (1 + yearsFromNow * 0.05)));
                
                probabilities.add(milestone);
            }
        }
        
        return probabilities;
    }

    /**
     * Calculate intervention impacts
     */
    private List<Map<String, Object>> calculateInterventionImpacts(
            double heartRisk, double diabetesRisk, double strokeRisk, double cancerRisk,
            boolean currentlySmoker, int currentExercise, String currentDiet, double currentBMI) {
        
        List<Map<String, Object>> interventions = new ArrayList<>();
        
        // Quit smoking intervention
        if (currentlySmoker) {
            Map<String, Object> quitSmoking = new HashMap<>();
            quitSmoking.put("intervention", "Quit Smoking");
            quitSmoking.put("description", "Stop all tobacco use");
            quitSmoking.put("heartRiskReduction", Math.round(heartRisk * 0.35));
            quitSmoking.put("strokeRiskReduction", Math.round(strokeRisk * 0.40));
            quitSmoking.put("cancerRiskReduction", Math.round(cancerRisk * 0.50));
            quitSmoking.put("lifeYearsGained", 7);
            quitSmoking.put("difficulty", "High");
            quitSmoking.put("timeToEffect", "1-5 years");
            interventions.add(quitSmoking);
        }
        
        // Increase exercise intervention
        if (currentExercise < 5) {
            Map<String, Object> exercise = new HashMap<>();
            exercise.put("intervention", "Increase Exercise");
            exercise.put("description", "150+ minutes moderate exercise per week");
            exercise.put("heartRiskReduction", Math.round(heartRisk * 0.20));
            exercise.put("diabetesRiskReduction", Math.round(diabetesRisk * 0.30));
            exercise.put("cancerRiskReduction", Math.round(cancerRisk * 0.15));
            exercise.put("lifeYearsGained", 3);
            exercise.put("difficulty", "Medium");
            exercise.put("timeToEffect", "3-6 months");
            interventions.add(exercise);
        }
        
        // Diet improvement
        if (!currentDiet.equalsIgnoreCase("mediterranean") && !currentDiet.equalsIgnoreCase("healthy")) {
            Map<String, Object> diet = new HashMap<>();
            diet.put("intervention", "Mediterranean Diet");
            diet.put("description", "Adopt heart-healthy Mediterranean eating pattern");
            diet.put("heartRiskReduction", Math.round(heartRisk * 0.25));
            diet.put("diabetesRiskReduction", Math.round(diabetesRisk * 0.35));
            diet.put("cancerRiskReduction", Math.round(cancerRisk * 0.10));
            diet.put("lifeYearsGained", 4);
            diet.put("difficulty", "Medium");
            diet.put("timeToEffect", "6-12 months");
            interventions.add(diet);
        }
        
        // Weight loss
        if (currentBMI > 25) {
            Map<String, Object> weightLoss = new HashMap<>();
            weightLoss.put("intervention", "Achieve Healthy Weight");
            weightLoss.put("description", "Reach BMI under 25 through diet and exercise");
            weightLoss.put("heartRiskReduction", Math.round(heartRisk * 0.15));
            weightLoss.put("diabetesRiskReduction", Math.round(diabetesRisk * 0.40));
            weightLoss.put("strokeRiskReduction", Math.round(strokeRisk * 0.10));
            weightLoss.put("lifeYearsGained", 3);
            weightLoss.put("difficulty", "High");
            weightLoss.put("timeToEffect", "6-24 months");
            interventions.add(weightLoss);
        }
        
        // Blood pressure management
        Map<String, Object> bpManagement = new HashMap<>();
        bpManagement.put("intervention", "Blood Pressure Control");
        bpManagement.put("description", "Maintain BP below 120/80 through lifestyle and medication if needed");
        bpManagement.put("heartRiskReduction", Math.round(heartRisk * 0.20));
        bpManagement.put("strokeRiskReduction", Math.round(strokeRisk * 0.35));
        bpManagement.put("lifeYearsGained", 2);
        bpManagement.put("difficulty", "Medium");
        bpManagement.put("timeToEffect", "1-3 months");
        interventions.add(bpManagement);
        
        // Regular screening
        Map<String, Object> screening = new HashMap<>();
        screening.put("intervention", "Regular Health Screenings");
        screening.put("description", "Annual checkups, cancer screenings, blood tests");
        screening.put("cancerRiskReduction", Math.round(cancerRisk * 0.25));
        screening.put("diabetesRiskReduction", Math.round(diabetesRisk * 0.15));
        screening.put("lifeYearsGained", 2);
        screening.put("difficulty", "Low");
        screening.put("timeToEffect", "Immediate");
        interventions.add(screening);
        
        return interventions;
    }

    /**
     * Generate AI-powered insights using Gemini with comprehensive health data
     */
    private String generateAIInsights(Patient patient, int age, double heartRisk, 
                                       double diabetesRisk, double strokeRisk, double cancerRisk,
                                       Map<String, Object> healthInputs) {
        try {
            StringBuilder prompt = new StringBuilder();
            prompt.append("You are a preventive medicine specialist AI. Analyze this patient's comprehensive health profile and provide detailed, actionable insights.\n\n");
            
            // Patient Demographics
            prompt.append("=== PATIENT PROFILE ===\n");
            prompt.append("Name: ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("\n");
            prompt.append("Age: ").append(age).append(" years\n");
            prompt.append("Gender: ").append(getStringValue(healthInputs, "gender", patient.getGender().toString())).append("\n");
            prompt.append("BMI: ").append(String.format("%.1f", getDoubleValue(healthInputs, "bmi", 25.0)));
            double bmi = getDoubleValue(healthInputs, "bmi", 25.0);
            prompt.append(" (").append(bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese").append(")\n\n");
            
            // Calculated Risk Scores
            prompt.append("=== CALCULATED 10-YEAR RISK SCORES ===\n");
            prompt.append("Heart Disease (Framingham): ").append(String.format("%.1f", heartRisk)).append("%\n");
            prompt.append("Type 2 Diabetes: ").append(String.format("%.1f", diabetesRisk)).append("%\n");
            prompt.append("Stroke: ").append(String.format("%.1f", strokeRisk)).append("%\n");
            prompt.append("Cancer: ").append(String.format("%.1f", cancerRisk)).append("%\n\n");
            
            // Vital Signs
            prompt.append("=== VITAL SIGNS & BIOMARKERS ===\n");
            prompt.append("Blood Pressure: ").append(getIntValue(healthInputs, "systolicBP", 120)).append("/");
            prompt.append(getIntValue(healthInputs, "diastolicBP", 80)).append(" mmHg\n");
            prompt.append("Resting Heart Rate: ").append(getIntValue(healthInputs, "restingHeartRate", 72)).append(" bpm\n");
            prompt.append("Total Cholesterol: ").append(getIntValue(healthInputs, "totalCholesterol", 200)).append(" mg/dL\n");
            prompt.append("LDL Cholesterol: ").append(getIntValue(healthInputs, "ldlCholesterol", 130)).append(" mg/dL\n");
            prompt.append("HDL Cholesterol: ").append(getIntValue(healthInputs, "hdlCholesterol", 50)).append(" mg/dL\n");
            prompt.append("Triglycerides: ").append(getIntValue(healthInputs, "triglycerides", 150)).append(" mg/dL\n");
            prompt.append("Fasting Glucose: ").append(getIntValue(healthInputs, "fastingGlucose", 95)).append(" mg/dL\n");
            prompt.append("HbA1c: ").append(String.format("%.1f", getDoubleValue(healthInputs, "hba1c", 5.5))).append("%\n\n");
            
            // Lifestyle Factors
            prompt.append("=== LIFESTYLE FACTORS ===\n");
            boolean smoker = getBoolValue(healthInputs, "smoker", false);
            prompt.append("Smoking: ").append(smoker ? "Yes (" + getIntValue(healthInputs, "cigarettesPerDay", 0) + " cigarettes/day for " + getIntValue(healthInputs, "smokingYears", 0) + " years)" : "No");
            if (getBoolValue(healthInputs, "formerSmoker", false)) {
                prompt.append(" - Former smoker, quit ").append(getIntValue(healthInputs, "yearsQuitSmoking", 0)).append(" years ago");
            }
            prompt.append("\n");
            prompt.append("Alcohol: ").append(getStringValue(healthInputs, "alcoholConsumption", "moderate"));
            prompt.append(" (").append(getIntValue(healthInputs, "drinksPerWeek", 3)).append(" drinks/week)\n");
            prompt.append("Exercise: ").append(getIntValue(healthInputs, "exerciseHoursPerWeek", 2)).append(" hours/week");
            prompt.append(" (").append(getStringValue(healthInputs, "exerciseIntensity", "moderate")).append(" intensity)\n");
            prompt.append("Sedentary Time: ").append(getIntValue(healthInputs, "sedentaryHoursPerDay", 8)).append(" hours/day\n");
            prompt.append("Diet Quality: ").append(getStringValue(healthInputs, "diet", "average")).append("\n");
            prompt.append("Daily Vegetable Servings: ").append(getIntValue(healthInputs, "dailyVegetableServings", 2)).append("\n");
            prompt.append("Daily Fruit Servings: ").append(getIntValue(healthInputs, "dailyFruitServings", 1)).append("\n");
            prompt.append("Processed Food Intake: ").append(getStringValue(healthInputs, "processedFoodFrequency", "sometimes")).append("\n");
            prompt.append("Sleep: ").append(getIntValue(healthInputs, "sleepHoursPerNight", 7)).append(" hours/night");
            prompt.append(" (").append(getStringValue(healthInputs, "sleepQuality", "fair")).append(" quality)\n");
            prompt.append("Stress Level: ").append(getStringValue(healthInputs, "stressLevel", "moderate")).append("\n\n");
            
            // Medical History
            prompt.append("=== MEDICAL HISTORY ===\n");
            prompt.append("Current Conditions: ");
            List<String> conditions = new ArrayList<>();
            if (getBoolValue(healthInputs, "diabetic", false)) conditions.add("Diabetes (" + getStringValue(healthInputs, "diabetesType", "type2") + ")");
            if (getBoolValue(healthInputs, "hasChronicKidneyDisease", false)) conditions.add("Chronic Kidney Disease");
            if (getBoolValue(healthInputs, "hasArrhythmia", false)) conditions.add("Heart Arrhythmia");
            if (getBoolValue(healthInputs, "hasAnxiety", false)) conditions.add("Anxiety");
            if (getBoolValue(healthInputs, "hasDepression", false)) conditions.add("Depression");
            prompt.append(conditions.isEmpty() ? "None reported" : String.join(", ", conditions)).append("\n");
            
            prompt.append("Past Events: ");
            List<String> events = new ArrayList<>();
            if (getBoolValue(healthInputs, "hadHeartAttack", false)) events.add("Previous Heart Attack");
            if (getBoolValue(healthInputs, "hadStroke", false)) events.add("Previous Stroke");
            prompt.append(events.isEmpty() ? "None reported" : String.join(", ", events)).append("\n");
            
            prompt.append("Current Medications: ");
            List<String> meds = new ArrayList<>();
            if (getBoolValue(healthInputs, "onBPMeds", false)) meds.add("Blood Pressure Medication");
            if (getBoolValue(healthInputs, "onCholesterolMeds", false)) meds.add("Statins");
            if (getBoolValue(healthInputs, "onDiabetesMeds", false)) meds.add("Diabetes Medication");
            prompt.append(meds.isEmpty() ? "None" : String.join(", ", meds)).append("\n\n");
            
            // Family History
            prompt.append("=== FAMILY HISTORY ===\n");
            List<String> familyHistory = new ArrayList<>();
            if (getBoolValue(healthInputs, "familyHistoryHeartDisease", false)) familyHistory.add("Heart Disease");
            if (getBoolValue(healthInputs, "familyHistoryDiabetes", false)) familyHistory.add("Diabetes");
            if (getBoolValue(healthInputs, "familyHistoryStroke", false)) familyHistory.add("Stroke");
            if (getBoolValue(healthInputs, "familyHistoryCancer", false)) familyHistory.add("Cancer");
            if (getBoolValue(healthInputs, "familyHistoryHypertension", false)) familyHistory.add("Hypertension");
            if (getBoolValue(healthInputs, "familyHistoryObesity", false)) familyHistory.add("Obesity");
            prompt.append(familyHistory.isEmpty() ? "No significant family history reported" : String.join(", ", familyHistory)).append("\n\n");
            
            // Instructions for AI
            prompt.append("=== ANALYSIS INSTRUCTIONS ===\n");
            prompt.append("Provide a comprehensive health analysis in JSON format with the following structure:\n");
            prompt.append("{\n");
            prompt.append("  \"primaryClinicalSummary\": \"A 3-4 sentence summary of the patient's current health status\",\n");
            prompt.append("  \"primaryClinicalImpression\": \"One sentence clinical impression\",\n");
            prompt.append("  \"diseaseStage\": {\n");
            prompt.append("    \"stage\": \"Early/Moderate/Advanced\",\n");
            prompt.append("    \"explanation\": [\"reason 1\", \"reason 2\"]\n");
            prompt.append("  },\n");
            prompt.append("  \"riskAssessment\": {\n");
            prompt.append("    \"overallRiskLevel\": \"Low/Moderate/High/Very High\",\n");
            prompt.append("    \"riskOfProgression\": number (0-100),\n");
            prompt.append("    \"confidenceScore\": number (0-100),\n");
            prompt.append("    \"riskFactors\": \"Description of key risk factors\"\n");
            prompt.append("  },\n");
            prompt.append("  \"keyIndicators\": [\"indicator 1\", \"indicator 2\", ...],\n");
            prompt.append("  \"differentialDiagnosis\": [\n");
            prompt.append("    {\"condition\": \"name\", \"likelihood\": \"High/Medium/Low\", \"justification\": \"reason\"}\n");
            prompt.append("  ],\n");
            prompt.append("  \"recommendations\": {\n");
            prompt.append("    \"immediateActions\": [\"action 1\", \"action 2\", \"action 3\"],\n");
            prompt.append("    \"furtherDiagnosticEvaluation\": [\"test 1\", \"test 2\"],\n");
            prompt.append("    \"monitoringAndFollowUp\": [\"item 1\", \"item 2\"]\n");
            prompt.append("  },\n");
            prompt.append("  \"warningSigns\": [\"sign 1\", \"sign 2\", \"sign 3\"],\n");
            prompt.append("  \"uncertaintyAndLimitations\": \"Any limitations in the analysis\",\n");
            prompt.append("  \"finalAINote\": \"Standard disclaimer about AI analysis\"\n");
            prompt.append("}\n\n");
            prompt.append("Be specific, actionable, and base recommendations on the actual data provided. Focus on the most impactful changes for this specific patient.");

            return geminiService.generateContent(prompt.toString(), "Comprehensive Predictive Health Analysis");
        } catch (Exception e) {
            return "AI insights temporarily unavailable. Please review your risk scores and intervention options above.";
        }
    }

    /**
     * Calculate overall health score
     */
    private int calculateOverallHealthScore(double heartRisk, double diabetesRisk, 
                                             double strokeRisk, double cancerRisk) {
        double avgRisk = (heartRisk + diabetesRisk + strokeRisk + cancerRisk) / 4;
        return (int) Math.round(100 - avgRisk);
    }

    /**
     * Estimate life expectancy based on current health
     */
    private double calculateLifeExpectancy(int currentAge, double avgRisk, boolean smoker) {
        // Base life expectancy (US average)
        double baseExpectancy = 78.0;
        
        // Adjust for current age
        if (currentAge > 65) {
            baseExpectancy = 85.0; // Survivors effect
        }
        
        // Adjust for risk
        double riskAdjustment = avgRisk * 0.15;
        
        // Smoking penalty
        if (smoker) {
            riskAdjustment += 10;
        }
        
        return Math.max(currentAge + 1, baseExpectancy - riskAdjustment);
    }

    // Helper methods
    private int calculateAge(java.time.LocalDate birthDate) {
        if (birthDate == null) return 30; // Default
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    private int getIntValue(Map<String, Object> map, String key, int defaultValue) {
        Object value = map.get(key);
        if (value == null) return defaultValue;
        if (value instanceof Number) return ((Number) value).intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private double getDoubleValue(Map<String, Object> map, String key, double defaultValue) {
        Object value = map.get(key);
        if (value == null) return defaultValue;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private boolean getBoolValue(Map<String, Object> map, String key, boolean defaultValue) {
        Object value = map.get(key);
        if (value == null) return defaultValue;
        if (value instanceof Boolean) return (Boolean) value;
        return Boolean.parseBoolean(value.toString());
    }

    private String getStringValue(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        if (value == null) return defaultValue;
        return value.toString();
    }
    
    /**
     * Calculate What-If scenario - compare current vs modified lifestyle
     */
    public Map<String, Object> calculateWhatIfScenario(Long patientId, Map<String, Object> scenarioInputs) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        int currentAge = calculateAge(patient.getDateOfBirth());
        boolean isMale = patient.getGender() == Patient.Gender.MALE;

        // Get current (baseline) values - use defaults for comparison
        int baselineSystolicBP = getIntValue(scenarioInputs, "baselineSystolicBP", 120);
        int baselineTotalCholesterol = getIntValue(scenarioInputs, "baselineTotalCholesterol", 200);
        int baselineHDLCholesterol = getIntValue(scenarioInputs, "baselineHDLCholesterol", 50);
        boolean baselineSmoker = getBoolValue(scenarioInputs, "baselineSmoker", false);
        boolean baselineDiabetic = getBoolValue(scenarioInputs, "baselineDiabetic", false);
        boolean baselineOnBPMeds = getBoolValue(scenarioInputs, "baselineOnBPMeds", false);
        int baselineExercise = getIntValue(scenarioInputs, "baselineExerciseHoursPerWeek", 2);
        String baselineDiet = getStringValue(scenarioInputs, "baselineDiet", "average");
        double baselineBMI = getDoubleValue(scenarioInputs, "baselineBMI", 25.0);
        boolean baselineFamilyHeartDisease = getBoolValue(scenarioInputs, "familyHistoryHeartDisease", false);
        boolean baselineFamilyDiabetes = getBoolValue(scenarioInputs, "familyHistoryDiabetes", false);

        // Get modified (what-if) values
        int modifiedSystolicBP = getIntValue(scenarioInputs, "systolicBP", baselineSystolicBP);
        int modifiedTotalCholesterol = getIntValue(scenarioInputs, "totalCholesterol", baselineTotalCholesterol);
        int modifiedHDLCholesterol = getIntValue(scenarioInputs, "hdlCholesterol", baselineHDLCholesterol);
        boolean modifiedSmoker = getBoolValue(scenarioInputs, "smoker", baselineSmoker);
        boolean modifiedDiabetic = getBoolValue(scenarioInputs, "diabetic", baselineDiabetic);
        boolean modifiedOnBPMeds = getBoolValue(scenarioInputs, "onBPMeds", baselineOnBPMeds);
        int modifiedExercise = getIntValue(scenarioInputs, "exerciseHoursPerWeek", baselineExercise);
        String modifiedDiet = getStringValue(scenarioInputs, "diet", baselineDiet);
        double modifiedBMI = getDoubleValue(scenarioInputs, "bmi", baselineBMI);

        // Calculate baseline risks
        double baselineHeartRisk = calculateFraminghamRiskScore(currentAge, isMale, baselineSystolicBP, 
            baselineTotalCholesterol, baselineHDLCholesterol, baselineSmoker, baselineDiabetic, baselineOnBPMeds);
        double baselineDiabetesRisk = calculateDiabetesRisk(currentAge, baselineBMI, baselineFamilyDiabetes, 
            baselineExercise, baselineDiet);
        double baselineStrokeRisk = calculateStrokeRisk(currentAge, baselineSystolicBP, baselineSmoker, 
            baselineDiabetic, baselineFamilyHeartDisease);
        double baselineCancerRisk = calculateCancerRisk(currentAge, baselineSmoker, baselineBMI, 
            baselineExercise, baselineDiet);

        // Calculate modified risks
        double modifiedHeartRisk = calculateFraminghamRiskScore(currentAge, isMale, modifiedSystolicBP, 
            modifiedTotalCholesterol, modifiedHDLCholesterol, modifiedSmoker, modifiedDiabetic, modifiedOnBPMeds);
        double modifiedDiabetesRisk = calculateDiabetesRisk(currentAge, modifiedBMI, baselineFamilyDiabetes, 
            modifiedExercise, modifiedDiet);
        double modifiedStrokeRisk = calculateStrokeRisk(currentAge, modifiedSystolicBP, modifiedSmoker, 
            modifiedDiabetic, baselineFamilyHeartDisease);
        double modifiedCancerRisk = calculateCancerRisk(currentAge, modifiedSmoker, modifiedBMI, 
            modifiedExercise, modifiedDiet);

        // Calculate changes
        Map<String, Object> riskChanges = new HashMap<>();
        riskChanges.put("heartDiseaseChange", round2(modifiedHeartRisk - baselineHeartRisk));
        riskChanges.put("diabetesChange", round2(modifiedDiabetesRisk - baselineDiabetesRisk));
        riskChanges.put("strokeChange", round2(modifiedStrokeRisk - baselineStrokeRisk));
        riskChanges.put("cancerChange", round2(modifiedCancerRisk - baselineCancerRisk));

        // Calculate life expectancy impact
        double baselineAvgRisk = (baselineHeartRisk + baselineDiabetesRisk + baselineStrokeRisk + baselineCancerRisk) / 4;
        double modifiedAvgRisk = (modifiedHeartRisk + modifiedDiabetesRisk + modifiedStrokeRisk + modifiedCancerRisk) / 4;
        
        double baselineLifeExpectancy = calculateLifeExpectancy(currentAge, baselineAvgRisk, baselineSmoker);
        double modifiedLifeExpectancy = calculateLifeExpectancy(currentAge, modifiedAvgRisk, modifiedSmoker);
        double lifeYearsGained = modifiedLifeExpectancy - baselineLifeExpectancy;

        // Generate trajectories for comparison
        List<Map<String, Object>> baselineTrajectory = generateTrajectory(
            currentAge, baselineHeartRisk, baselineDiabetesRisk, baselineStrokeRisk, baselineCancerRisk,
            baselineSmoker, baselineExercise, baselineDiet, baselineBMI, "current"
        );
        
        List<Map<String, Object>> modifiedTrajectory = generateTrajectory(
            currentAge, modifiedHeartRisk, modifiedDiabetesRisk, modifiedStrokeRisk, modifiedCancerRisk,
            modifiedSmoker, modifiedExercise, modifiedDiet, modifiedBMI, 
            modifiedAvgRisk < baselineAvgRisk ? "improved" : "current"
        );

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("patientId", patientId);
        response.put("patientName", patient.getFirstName() + " " + patient.getLastName());
        response.put("currentAge", currentAge);
        
        // Baseline risks
        Map<String, Object> baselineRisks = new HashMap<>();
        baselineRisks.put("heartDisease", round2(baselineHeartRisk));
        baselineRisks.put("diabetes", round2(baselineDiabetesRisk));
        baselineRisks.put("stroke", round2(baselineStrokeRisk));
        baselineRisks.put("cancer", round2(baselineCancerRisk));
        baselineRisks.put("overallHealthScore", calculateOverallHealthScore(baselineHeartRisk, baselineDiabetesRisk, baselineStrokeRisk, baselineCancerRisk));
        baselineRisks.put("lifeExpectancy", round2(baselineLifeExpectancy));
        response.put("baselineRisks", baselineRisks);
        
        // Modified risks
        Map<String, Object> modifiedRisks = new HashMap<>();
        modifiedRisks.put("heartDisease", round2(modifiedHeartRisk));
        modifiedRisks.put("diabetes", round2(modifiedDiabetesRisk));
        modifiedRisks.put("stroke", round2(modifiedStrokeRisk));
        modifiedRisks.put("cancer", round2(modifiedCancerRisk));
        modifiedRisks.put("overallHealthScore", calculateOverallHealthScore(modifiedHeartRisk, modifiedDiabetesRisk, modifiedStrokeRisk, modifiedCancerRisk));
        modifiedRisks.put("lifeExpectancy", round2(modifiedLifeExpectancy));
        response.put("modifiedRisks", modifiedRisks);
        
        // Changes and impact
        response.put("riskChanges", riskChanges);
        response.put("lifeYearsGained", round2(lifeYearsGained));
        response.put("overallRiskReduction", round2(baselineAvgRisk - modifiedAvgRisk));
        
        // Trajectories
        response.put("baselineTrajectory", baselineTrajectory);
        response.put("modifiedTrajectory", modifiedTrajectory);
        
        // Summary of what changed
        List<String> changesApplied = new ArrayList<>();
        if (modifiedSmoker != baselineSmoker) changesApplied.add(modifiedSmoker ? "Started smoking" : "Quit smoking");
        if (modifiedExercise != baselineExercise) changesApplied.add("Exercise: " + baselineExercise + " → " + modifiedExercise + " hrs/week");
        if (!modifiedDiet.equals(baselineDiet)) changesApplied.add("Diet: " + baselineDiet + " → " + modifiedDiet);
        if (Math.abs(modifiedBMI - baselineBMI) > 0.5) changesApplied.add("BMI: " + round2(baselineBMI) + " → " + round2(modifiedBMI));
        if (modifiedSystolicBP != baselineSystolicBP) changesApplied.add("Blood pressure: " + baselineSystolicBP + " → " + modifiedSystolicBP);
        response.put("changesApplied", changesApplied);
        
        // Impact assessment
        String impactLevel;
        if (lifeYearsGained > 5) impactLevel = "Transformative";
        else if (lifeYearsGained > 2) impactLevel = "Significant";
        else if (lifeYearsGained > 0) impactLevel = "Moderate";
        else if (lifeYearsGained < -2) impactLevel = "Harmful";
        else impactLevel = "Minimal";
        response.put("impactLevel", impactLevel);
        
        response.put("generatedAt", LocalDate.now().toString());
        
        return response;
    }
    
    private double round2(double value) {
        return Math.round(value * 100) / 100.0;
    }
}

