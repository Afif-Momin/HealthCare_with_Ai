package com.medicalai.service;

import com.medicalai.entity.Patient;
import com.medicalai.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PopulationIntelligenceService {

    @Autowired
    private PatientRepository patientRepository;

    /**
     * Analyzes all patients in the database and returns population-level health insights.
     * @return Map containing various population health metrics and statistics
     */
    public Map<String, Object> analyzeAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        Map<String, Object> populationData = new HashMap<>();

        if (patients.isEmpty()) {
            populationData.put("totalPatients", 0);
            populationData.put("message", "No patients found in the database");
            return populationData;
        }

        // Basic Demographics
        populationData.put("totalPatients", patients.size());
        populationData.put("genderDistribution", analyzeGenderDistribution(patients));
        populationData.put("ageDistribution", analyzeAgeDistribution(patients));

        // Health Metrics
        populationData.put("bloodGroupDistribution", analyzeBloodGroupDistribution(patients));
        populationData.put("vitalSignsStatistics", analyzeVitalSigns(patients));
        populationData.put("cholesterolStatistics", analyzeCholesterol(patients));
        populationData.put("glucoseStatistics", analyzeGlucose(patients));

        // Lifestyle Analysis
        populationData.put("lifestyleAnalysis", analyzeLifestyle(patients));
        
        // Medical Conditions
        populationData.put("medicalConditions", analyzeMedicalConditions(patients));
        
        // Family History
        populationData.put("familyHistory", analyzeFamilyHistory(patients));
        
        // Risk Factors Summary
        populationData.put("riskFactorsSummary", analyzeRiskFactors(patients));

        return populationData;
    }

    private Map<String, Object> analyzeGenderDistribution(List<Patient> patients) {
        Map<String, Object> distribution = new HashMap<>();
        Map<String, Long> genderCounts = patients.stream()
                .filter(p -> p.getGender() != null)
                .collect(Collectors.groupingBy(p -> p.getGender().toString(), Collectors.counting()));
        
        distribution.put("counts", genderCounts);
        distribution.put("total", patients.size());
        return distribution;
    }

    private Map<String, Object> analyzeAgeDistribution(List<Patient> patients) {
        Map<String, Object> distribution = new HashMap<>();
        LocalDate today = LocalDate.now();
        
        Map<String, Long> ageGroups = new HashMap<>();
        ageGroups.put("0-18", 0L);
        ageGroups.put("19-35", 0L);
        ageGroups.put("36-50", 0L);
        ageGroups.put("51-65", 0L);
        ageGroups.put("65+", 0L);

        List<Integer> ages = new ArrayList<>();
        
        for (Patient patient : patients) {
            if (patient.getDateOfBirth() != null) {
                int age = Period.between(patient.getDateOfBirth(), today).getYears();
                ages.add(age);
                
                if (age <= 18) ageGroups.merge("0-18", 1L, Long::sum);
                else if (age <= 35) ageGroups.merge("19-35", 1L, Long::sum);
                else if (age <= 50) ageGroups.merge("36-50", 1L, Long::sum);
                else if (age <= 65) ageGroups.merge("51-65", 1L, Long::sum);
                else ageGroups.merge("65+", 1L, Long::sum);
            }
        }

        distribution.put("groups", ageGroups);
        if (!ages.isEmpty()) {
            distribution.put("averageAge", ages.stream().mapToInt(Integer::intValue).average().orElse(0));
            distribution.put("minAge", ages.stream().mapToInt(Integer::intValue).min().orElse(0));
            distribution.put("maxAge", ages.stream().mapToInt(Integer::intValue).max().orElse(0));
        }
        return distribution;
    }

    private Map<String, Long> analyzeBloodGroupDistribution(List<Patient> patients) {
        return patients.stream()
                .filter(p -> p.getBloodGroup() != null && !p.getBloodGroup().isEmpty())
                .collect(Collectors.groupingBy(Patient::getBloodGroup, Collectors.counting()));
    }

    private Map<String, Object> analyzeVitalSigns(List<Patient> patients) {
        Map<String, Object> stats = new HashMap<>();
        
        // Blood Pressure Analysis
        List<Integer> systolicValues = patients.stream()
                .filter(p -> p.getSystolicBP() != null)
                .map(Patient::getSystolicBP)
                .collect(Collectors.toList());
        
        List<Integer> diastolicValues = patients.stream()
                .filter(p -> p.getDiastolicBP() != null)
                .map(Patient::getDiastolicBP)
                .collect(Collectors.toList());

        if (!systolicValues.isEmpty()) {
            stats.put("systolicBP", Map.of(
                    "average", systolicValues.stream().mapToInt(Integer::intValue).average().orElse(0),
                    "min", systolicValues.stream().mapToInt(Integer::intValue).min().orElse(0),
                    "max", systolicValues.stream().mapToInt(Integer::intValue).max().orElse(0),
                    "count", systolicValues.size()
            ));
        }

        if (!diastolicValues.isEmpty()) {
            stats.put("diastolicBP", Map.of(
                    "average", diastolicValues.stream().mapToInt(Integer::intValue).average().orElse(0),
                    "min", diastolicValues.stream().mapToInt(Integer::intValue).min().orElse(0),
                    "max", diastolicValues.stream().mapToInt(Integer::intValue).max().orElse(0),
                    "count", diastolicValues.size()
            ));
        }

        // Heart Rate Analysis
        List<Integer> heartRates = patients.stream()
                .filter(p -> p.getRestingHeartRate() != null)
                .map(Patient::getRestingHeartRate)
                .collect(Collectors.toList());

        if (!heartRates.isEmpty()) {
            stats.put("restingHeartRate", Map.of(
                    "average", heartRates.stream().mapToInt(Integer::intValue).average().orElse(0),
                    "min", heartRates.stream().mapToInt(Integer::intValue).min().orElse(0),
                    "max", heartRates.stream().mapToInt(Integer::intValue).max().orElse(0),
                    "count", heartRates.size()
            ));
        }

        return stats;
    }

    private Map<String, Object> analyzeCholesterol(List<Patient> patients) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Integer> totalCholesterol = patients.stream()
                .filter(p -> p.getTotalCholesterol() != null)
                .map(Patient::getTotalCholesterol)
                .collect(Collectors.toList());

        if (!totalCholesterol.isEmpty()) {
            double avg = totalCholesterol.stream().mapToInt(Integer::intValue).average().orElse(0);
            stats.put("totalCholesterol", Map.of(
                    "average", avg,
                    "count", totalCholesterol.size(),
                    "highRiskCount", totalCholesterol.stream().filter(c -> c > 240).count()
            ));
        }

        List<Integer> ldlValues = patients.stream()
                .filter(p -> p.getLdlCholesterol() != null)
                .map(Patient::getLdlCholesterol)
                .collect(Collectors.toList());

        if (!ldlValues.isEmpty()) {
            stats.put("ldlCholesterol", Map.of(
                    "average", ldlValues.stream().mapToInt(Integer::intValue).average().orElse(0),
                    "count", ldlValues.size(),
                    "highRiskCount", ldlValues.stream().filter(c -> c > 160).count()
            ));
        }

        List<Integer> hdlValues = patients.stream()
                .filter(p -> p.getHdlCholesterol() != null)
                .map(Patient::getHdlCholesterol)
                .collect(Collectors.toList());

        if (!hdlValues.isEmpty()) {
            stats.put("hdlCholesterol", Map.of(
                    "average", hdlValues.stream().mapToInt(Integer::intValue).average().orElse(0),
                    "count", hdlValues.size(),
                    "lowRiskCount", hdlValues.stream().filter(c -> c < 40).count()
            ));
        }

        return stats;
    }

    private Map<String, Object> analyzeGlucose(List<Patient> patients) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Integer> fastingGlucose = patients.stream()
                .filter(p -> p.getFastingGlucose() != null)
                .map(Patient::getFastingGlucose)
                .collect(Collectors.toList());

        if (!fastingGlucose.isEmpty()) {
            stats.put("fastingGlucose", Map.of(
                    "average", fastingGlucose.stream().mapToInt(Integer::intValue).average().orElse(0),
                    "count", fastingGlucose.size(),
                    "prediabeticCount", fastingGlucose.stream().filter(g -> g >= 100 && g < 126).count(),
                    "diabeticCount", fastingGlucose.stream().filter(g -> g >= 126).count()
            ));
        }

        List<Double> hba1cValues = patients.stream()
                .filter(p -> p.getHba1c() != null)
                .map(Patient::getHba1c)
                .collect(Collectors.toList());

        if (!hba1cValues.isEmpty()) {
            stats.put("hba1c", Map.of(
                    "average", hba1cValues.stream().mapToDouble(Double::doubleValue).average().orElse(0),
                    "count", hba1cValues.size(),
                    "prediabeticCount", hba1cValues.stream().filter(h -> h >= 5.7 && h < 6.5).count(),
                    "diabeticCount", hba1cValues.stream().filter(h -> h >= 6.5).count()
            ));
        }

        return stats;
    }

    private Map<String, Object> analyzeLifestyle(List<Patient> patients) {
        Map<String, Object> analysis = new HashMap<>();
        
        // Smoking Analysis
        long smokerCount = patients.stream().filter(p -> Boolean.TRUE.equals(p.getSmoker())).count();
        long formerSmokerCount = patients.stream().filter(p -> Boolean.TRUE.equals(p.getFormerSmoker())).count();
        analysis.put("smoking", Map.of(
                "currentSmokers", smokerCount,
                "formerSmokers", formerSmokerCount,
                "neverSmoked", patients.size() - smokerCount - formerSmokerCount
        ));

        // Alcohol Analysis
        Map<String, Long> alcoholDistribution = patients.stream()
                .filter(p -> p.getAlcoholConsumption() != null)
                .collect(Collectors.groupingBy(Patient::getAlcoholConsumption, Collectors.counting()));
        analysis.put("alcoholConsumption", alcoholDistribution);

        // Exercise Analysis
        List<Integer> exerciseHours = patients.stream()
                .filter(p -> p.getExerciseHoursPerWeek() != null)
                .map(Patient::getExerciseHoursPerWeek)
                .collect(Collectors.toList());
        
        if (!exerciseHours.isEmpty()) {
            analysis.put("exercise", Map.of(
                    "averageHoursPerWeek", exerciseHours.stream().mapToInt(Integer::intValue).average().orElse(0),
                    "sedentaryCount", exerciseHours.stream().filter(h -> h < 2).count(),
                    "activeCount", exerciseHours.stream().filter(h -> h >= 5).count()
            ));
        }

        // Diet Analysis
        Map<String, Long> dietDistribution = patients.stream()
                .filter(p -> p.getDiet() != null)
                .collect(Collectors.groupingBy(Patient::getDiet, Collectors.counting()));
        analysis.put("diet", dietDistribution);

        // Sleep Analysis
        List<Integer> sleepHours = patients.stream()
                .filter(p -> p.getSleepHoursPerNight() != null)
                .map(Patient::getSleepHoursPerNight)
                .collect(Collectors.toList());
        
        if (!sleepHours.isEmpty()) {
            analysis.put("sleep", Map.of(
                    "averageHoursPerNight", sleepHours.stream().mapToInt(Integer::intValue).average().orElse(0),
                    "insufficientSleepCount", sleepHours.stream().filter(h -> h < 7).count()
            ));
        }

        // Stress Analysis
        Map<String, Long> stressDistribution = patients.stream()
                .filter(p -> p.getStressLevel() != null)
                .collect(Collectors.groupingBy(Patient::getStressLevel, Collectors.counting()));
        analysis.put("stressLevels", stressDistribution);

        return analysis;
    }

    private Map<String, Object> analyzeMedicalConditions(List<Patient> patients) {
        Map<String, Object> conditions = new HashMap<>();

        conditions.put("diabetic", patients.stream().filter(p -> Boolean.TRUE.equals(p.getDiabetic())).count());
        conditions.put("onBPMedication", patients.stream().filter(p -> Boolean.TRUE.equals(p.getOnBPMeds())).count());
        conditions.put("onCholesterolMedication", patients.stream().filter(p -> Boolean.TRUE.equals(p.getOnCholesterolMeds())).count());
        conditions.put("hadHeartAttack", patients.stream().filter(p -> Boolean.TRUE.equals(p.getHadHeartAttack())).count());
        conditions.put("hadStroke", patients.stream().filter(p -> Boolean.TRUE.equals(p.getHadStroke())).count());
        conditions.put("chronicKidneyDisease", patients.stream().filter(p -> Boolean.TRUE.equals(p.getHasChronicKidneyDisease())).count());
        conditions.put("arrhythmia", patients.stream().filter(p -> Boolean.TRUE.equals(p.getHasArrhythmia())).count());
        conditions.put("anxiety", patients.stream().filter(p -> Boolean.TRUE.equals(p.getHasAnxiety())).count());
        conditions.put("depression", patients.stream().filter(p -> Boolean.TRUE.equals(p.getHasDepression())).count());

        return conditions;
    }

    private Map<String, Object> analyzeFamilyHistory(List<Patient> patients) {
        Map<String, Object> history = new HashMap<>();

        history.put("heartDisease", patients.stream().filter(p -> Boolean.TRUE.equals(p.getFamilyHistoryHeartDisease())).count());
        history.put("diabetes", patients.stream().filter(p -> Boolean.TRUE.equals(p.getFamilyHistoryDiabetes())).count());
        history.put("stroke", patients.stream().filter(p -> Boolean.TRUE.equals(p.getFamilyHistoryStroke())).count());
        history.put("cancer", patients.stream().filter(p -> Boolean.TRUE.equals(p.getFamilyHistoryCancer())).count());
        history.put("hypertension", patients.stream().filter(p -> Boolean.TRUE.equals(p.getFamilyHistoryHypertension())).count());
        history.put("obesity", patients.stream().filter(p -> Boolean.TRUE.equals(p.getFamilyHistoryObesity())).count());

        return history;
    }

    private Map<String, Object> analyzeRiskFactors(List<Patient> patients) {
        Map<String, Object> riskFactors = new HashMap<>();
        
        // High Blood Pressure Risk
        long highBPCount = patients.stream()
                .filter(p -> p.getSystolicBP() != null && p.getDiastolicBP() != null)
                .filter(p -> p.getSystolicBP() >= 140 || p.getDiastolicBP() >= 90)
                .count();
        riskFactors.put("highBloodPressureRisk", highBPCount);

        // High Cholesterol Risk
        long highCholesterolCount = patients.stream()
                .filter(p -> p.getTotalCholesterol() != null)
                .filter(p -> p.getTotalCholesterol() > 240)
                .count();
        riskFactors.put("highCholesterolRisk", highCholesterolCount);

        // Obesity Risk (BMI > 30)
        long obesityCount = patients.stream()
                .filter(p -> p.getHeight() != null && p.getWeight() != null)
                .filter(p -> p.getHeight() > 0)
                .filter(p -> {
                    double heightInMeters = p.getHeight() / 100.0;
                    double bmi = p.getWeight() / (heightInMeters * heightInMeters);
                    return bmi >= 30;
                })
                .count();
        riskFactors.put("obesityRisk", obesityCount);

        // Smoking Risk
        riskFactors.put("smokingRisk", patients.stream().filter(p -> Boolean.TRUE.equals(p.getSmoker())).count());

        // Sedentary Lifestyle Risk
        long sedentaryCount = patients.stream()
                .filter(p -> p.getExerciseHoursPerWeek() != null)
                .filter(p -> p.getExerciseHoursPerWeek() < 2)
                .count();
        riskFactors.put("sedentaryLifestyleRisk", sedentaryCount);

        // Calculate overall high-risk patient count (multiple risk factors)
        long multipleRiskFactors = patients.stream()
                .filter(p -> countRiskFactors(p) >= 3)
                .count();
        riskFactors.put("multipleRiskFactorsCount", multipleRiskFactors);

        return riskFactors;
    }

    private int countRiskFactors(Patient p) {
        int count = 0;
        
        if (p.getSystolicBP() != null && p.getSystolicBP() >= 140) count++;
        if (p.getTotalCholesterol() != null && p.getTotalCholesterol() > 240) count++;
        if (Boolean.TRUE.equals(p.getSmoker())) count++;
        if (Boolean.TRUE.equals(p.getDiabetic())) count++;
        if (p.getExerciseHoursPerWeek() != null && p.getExerciseHoursPerWeek() < 2) count++;
        if (p.getHeight() != null && p.getWeight() != null && p.getHeight() > 0) {
            double bmi = p.getWeight() / Math.pow(p.getHeight() / 100.0, 2);
            if (bmi >= 30) count++;
        }
        if (Boolean.TRUE.equals(p.getFamilyHistoryHeartDisease())) count++;
        
        return count;
    }
}
