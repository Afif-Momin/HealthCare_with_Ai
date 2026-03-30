package com.medicalai.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String lastName;

    @Email(message = "Email should be valid")
    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phoneNumber;

    @NotNull(message = "Date of birth is required")
    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;

    private String bloodGroup;
    private String allergies;
    private String medicalHistory;
    private String emergencyContactName;
    private String emergencyContactPhone;

    // ===== Health Profile for Predictive Analysis =====
    
    // Body Measurements
    private Double height; // in cm
    private Double weight; // in kg
    
    // Vital Signs & Biomarkers
    private Integer systolicBP;
    private Integer diastolicBP;
    private Integer restingHeartRate;
    private Integer totalCholesterol;
    private Integer ldlCholesterol;
    private Integer hdlCholesterol;
    private Integer triglycerides;
    private Integer fastingGlucose;
    private Double hba1c;
    
    // Lifestyle - Smoking
    private Boolean smoker;
    private Integer smokingYears;
    private Integer cigarettesPerDay;
    private Boolean formerSmoker;
    private Integer yearsQuitSmoking;
    
    // Lifestyle - Alcohol
    private String alcoholConsumption; // none, light, moderate, heavy
    private Integer drinksPerWeek;
    
    // Lifestyle - Exercise
    private Integer exerciseHoursPerWeek;
    private String exerciseIntensity; // light, moderate, vigorous
    private Integer sedentaryHoursPerDay;
    
    // Lifestyle - Diet
    private String diet; // poor, average, healthy, mediterranean, keto, vegan
    private Integer dailyVegetableServings;
    private Integer dailyFruitServings;
    private String processedFoodFrequency; // rarely, sometimes, often, daily
    
    // Lifestyle - Sleep & Stress
    private Integer sleepHoursPerNight;
    private String sleepQuality; // poor, fair, good, excellent
    private String stressLevel; // low, moderate, high, very_high
    
    // Medical Conditions
    private Boolean diabetic;
    private String diabetesType; // none, type1, type2, prediabetes
    private Boolean onBPMeds;
    private Boolean onCholesterolMeds;
    private Boolean onDiabetesMeds;
    private String otherMedications;
    
    // Past Medical Events
    private Boolean hadHeartAttack;
    private Boolean hadStroke;
    private Boolean hasChronicKidneyDisease;
    private Boolean hasAutoImmuneDisorder;
    private Boolean hasArrhythmia;
    private Boolean hasAnxiety;
    private Boolean hasDepression;
    
    // Family History
    private Boolean familyHistoryHeartDisease;
    private Integer familyHeartDiseaseAge;
    private Boolean familyHistoryDiabetes;
    private Boolean familyHistoryStroke;
    private Boolean familyHistoryCancer;
    private String familyCancerTypes;
    private Boolean familyHistoryHypertension;
    private Boolean familyHistoryObesity;
    
    // Environment & Occupation
    private String occupation; // manual, office, healthcare, other
    private Boolean exposureToToxins;
    private String airQualityIndex; // good, moderate, poor
    
    // Mental Health & Social
    private String socialConnections; // low, moderate, high
    
    // Last health profile update
    private LocalDateTime healthProfileUpdatedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalRecord> medicalRecords;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Gender {
        MALE, FEMALE, OTHER
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public LocalDate getDateOfBirth() {
		return dateOfBirth;
	}

	public void setDateOfBirth(LocalDate dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}

	public Gender getGender() {
		return gender;
	}

	public void setGender(Gender gender) {
		this.gender = gender;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getZipCode() {
		return zipCode;
	}

	public void setZipCode(String zipCode) {
		this.zipCode = zipCode;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getBloodGroup() {
		return bloodGroup;
	}

	public void setBloodGroup(String bloodGroup) {
		this.bloodGroup = bloodGroup;
	}

	public String getAllergies() {
		return allergies;
	}

	public void setAllergies(String allergies) {
		this.allergies = allergies;
	}

	public String getMedicalHistory() {
		return medicalHistory;
	}

	public void setMedicalHistory(String medicalHistory) {
		this.medicalHistory = medicalHistory;
	}

	public String getEmergencyContactName() {
		return emergencyContactName;
	}

	public void setEmergencyContactName(String emergencyContactName) {
		this.emergencyContactName = emergencyContactName;
	}

	public String getEmergencyContactPhone() {
		return emergencyContactPhone;
	}

	public void setEmergencyContactPhone(String emergencyContactPhone) {
		this.emergencyContactPhone = emergencyContactPhone;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public List<MedicalRecord> getMedicalRecords() {
		return medicalRecords;
	}

	public void setMedicalRecords(List<MedicalRecord> medicalRecords) {
		this.medicalRecords = medicalRecords;
	}

	public List<Appointment> getAppointments() {
		return appointments;
	}

	public void setAppointments(List<Appointment> appointments) {
		this.appointments = appointments;
	}

	// ===== Health Profile Getters and Setters =====
	
	public Double getHeight() { return height; }
	public void setHeight(Double height) { this.height = height; }
	
	public Double getWeight() { return weight; }
	public void setWeight(Double weight) { this.weight = weight; }
	
	public Integer getSystolicBP() { return systolicBP; }
	public void setSystolicBP(Integer systolicBP) { this.systolicBP = systolicBP; }
	
	public Integer getDiastolicBP() { return diastolicBP; }
	public void setDiastolicBP(Integer diastolicBP) { this.diastolicBP = diastolicBP; }
	
	public Integer getRestingHeartRate() { return restingHeartRate; }
	public void setRestingHeartRate(Integer restingHeartRate) { this.restingHeartRate = restingHeartRate; }
	
	public Integer getTotalCholesterol() { return totalCholesterol; }
	public void setTotalCholesterol(Integer totalCholesterol) { this.totalCholesterol = totalCholesterol; }
	
	public Integer getLdlCholesterol() { return ldlCholesterol; }
	public void setLdlCholesterol(Integer ldlCholesterol) { this.ldlCholesterol = ldlCholesterol; }
	
	public Integer getHdlCholesterol() { return hdlCholesterol; }
	public void setHdlCholesterol(Integer hdlCholesterol) { this.hdlCholesterol = hdlCholesterol; }
	
	public Integer getTriglycerides() { return triglycerides; }
	public void setTriglycerides(Integer triglycerides) { this.triglycerides = triglycerides; }
	
	public Integer getFastingGlucose() { return fastingGlucose; }
	public void setFastingGlucose(Integer fastingGlucose) { this.fastingGlucose = fastingGlucose; }
	
	public Double getHba1c() { return hba1c; }
	public void setHba1c(Double hba1c) { this.hba1c = hba1c; }
	
	public Boolean getSmoker() { return smoker; }
	public void setSmoker(Boolean smoker) { this.smoker = smoker; }
	
	public Integer getSmokingYears() { return smokingYears; }
	public void setSmokingYears(Integer smokingYears) { this.smokingYears = smokingYears; }
	
	public Integer getCigarettesPerDay() { return cigarettesPerDay; }
	public void setCigarettesPerDay(Integer cigarettesPerDay) { this.cigarettesPerDay = cigarettesPerDay; }
	
	public Boolean getFormerSmoker() { return formerSmoker; }
	public void setFormerSmoker(Boolean formerSmoker) { this.formerSmoker = formerSmoker; }
	
	public Integer getYearsQuitSmoking() { return yearsQuitSmoking; }
	public void setYearsQuitSmoking(Integer yearsQuitSmoking) { this.yearsQuitSmoking = yearsQuitSmoking; }
	
	public String getAlcoholConsumption() { return alcoholConsumption; }
	public void setAlcoholConsumption(String alcoholConsumption) { this.alcoholConsumption = alcoholConsumption; }
	
	public Integer getDrinksPerWeek() { return drinksPerWeek; }
	public void setDrinksPerWeek(Integer drinksPerWeek) { this.drinksPerWeek = drinksPerWeek; }
	
	public Integer getExerciseHoursPerWeek() { return exerciseHoursPerWeek; }
	public void setExerciseHoursPerWeek(Integer exerciseHoursPerWeek) { this.exerciseHoursPerWeek = exerciseHoursPerWeek; }
	
	public String getExerciseIntensity() { return exerciseIntensity; }
	public void setExerciseIntensity(String exerciseIntensity) { this.exerciseIntensity = exerciseIntensity; }
	
	public Integer getSedentaryHoursPerDay() { return sedentaryHoursPerDay; }
	public void setSedentaryHoursPerDay(Integer sedentaryHoursPerDay) { this.sedentaryHoursPerDay = sedentaryHoursPerDay; }
	
	public String getDiet() { return diet; }
	public void setDiet(String diet) { this.diet = diet; }
	
	public Integer getDailyVegetableServings() { return dailyVegetableServings; }
	public void setDailyVegetableServings(Integer dailyVegetableServings) { this.dailyVegetableServings = dailyVegetableServings; }
	
	public Integer getDailyFruitServings() { return dailyFruitServings; }
	public void setDailyFruitServings(Integer dailyFruitServings) { this.dailyFruitServings = dailyFruitServings; }
	
	public String getProcessedFoodFrequency() { return processedFoodFrequency; }
	public void setProcessedFoodFrequency(String processedFoodFrequency) { this.processedFoodFrequency = processedFoodFrequency; }
	
	public Integer getSleepHoursPerNight() { return sleepHoursPerNight; }
	public void setSleepHoursPerNight(Integer sleepHoursPerNight) { this.sleepHoursPerNight = sleepHoursPerNight; }
	
	public String getSleepQuality() { return sleepQuality; }
	public void setSleepQuality(String sleepQuality) { this.sleepQuality = sleepQuality; }
	
	public String getStressLevel() { return stressLevel; }
	public void setStressLevel(String stressLevel) { this.stressLevel = stressLevel; }
	
	public Boolean getDiabetic() { return diabetic; }
	public void setDiabetic(Boolean diabetic) { this.diabetic = diabetic; }
	
	public String getDiabetesType() { return diabetesType; }
	public void setDiabetesType(String diabetesType) { this.diabetesType = diabetesType; }
	
	public Boolean getOnBPMeds() { return onBPMeds; }
	public void setOnBPMeds(Boolean onBPMeds) { this.onBPMeds = onBPMeds; }
	
	public Boolean getOnCholesterolMeds() { return onCholesterolMeds; }
	public void setOnCholesterolMeds(Boolean onCholesterolMeds) { this.onCholesterolMeds = onCholesterolMeds; }
	
	public Boolean getOnDiabetesMeds() { return onDiabetesMeds; }
	public void setOnDiabetesMeds(Boolean onDiabetesMeds) { this.onDiabetesMeds = onDiabetesMeds; }
	
	public String getOtherMedications() { return otherMedications; }
	public void setOtherMedications(String otherMedications) { this.otherMedications = otherMedications; }
	
	public Boolean getHadHeartAttack() { return hadHeartAttack; }
	public void setHadHeartAttack(Boolean hadHeartAttack) { this.hadHeartAttack = hadHeartAttack; }
	
	public Boolean getHadStroke() { return hadStroke; }
	public void setHadStroke(Boolean hadStroke) { this.hadStroke = hadStroke; }
	
	public Boolean getHasChronicKidneyDisease() { return hasChronicKidneyDisease; }
	public void setHasChronicKidneyDisease(Boolean hasChronicKidneyDisease) { this.hasChronicKidneyDisease = hasChronicKidneyDisease; }
	
	public Boolean getHasAutoImmuneDisorder() { return hasAutoImmuneDisorder; }
	public void setHasAutoImmuneDisorder(Boolean hasAutoImmuneDisorder) { this.hasAutoImmuneDisorder = hasAutoImmuneDisorder; }
	
	public Boolean getHasArrhythmia() { return hasArrhythmia; }
	public void setHasArrhythmia(Boolean hasArrhythmia) { this.hasArrhythmia = hasArrhythmia; }
	
	public Boolean getHasAnxiety() { return hasAnxiety; }
	public void setHasAnxiety(Boolean hasAnxiety) { this.hasAnxiety = hasAnxiety; }
	
	public Boolean getHasDepression() { return hasDepression; }
	public void setHasDepression(Boolean hasDepression) { this.hasDepression = hasDepression; }
	
	public Boolean getFamilyHistoryHeartDisease() { return familyHistoryHeartDisease; }
	public void setFamilyHistoryHeartDisease(Boolean familyHistoryHeartDisease) { this.familyHistoryHeartDisease = familyHistoryHeartDisease; }
	
	public Integer getFamilyHeartDiseaseAge() { return familyHeartDiseaseAge; }
	public void setFamilyHeartDiseaseAge(Integer familyHeartDiseaseAge) { this.familyHeartDiseaseAge = familyHeartDiseaseAge; }
	
	public Boolean getFamilyHistoryDiabetes() { return familyHistoryDiabetes; }
	public void setFamilyHistoryDiabetes(Boolean familyHistoryDiabetes) { this.familyHistoryDiabetes = familyHistoryDiabetes; }
	
	public Boolean getFamilyHistoryStroke() { return familyHistoryStroke; }
	public void setFamilyHistoryStroke(Boolean familyHistoryStroke) { this.familyHistoryStroke = familyHistoryStroke; }
	
	public Boolean getFamilyHistoryCancer() { return familyHistoryCancer; }
	public void setFamilyHistoryCancer(Boolean familyHistoryCancer) { this.familyHistoryCancer = familyHistoryCancer; }
	
	public String getFamilyCancerTypes() { return familyCancerTypes; }
	public void setFamilyCancerTypes(String familyCancerTypes) { this.familyCancerTypes = familyCancerTypes; }
	
	public Boolean getFamilyHistoryHypertension() { return familyHistoryHypertension; }
	public void setFamilyHistoryHypertension(Boolean familyHistoryHypertension) { this.familyHistoryHypertension = familyHistoryHypertension; }
	
	public Boolean getFamilyHistoryObesity() { return familyHistoryObesity; }
	public void setFamilyHistoryObesity(Boolean familyHistoryObesity) { this.familyHistoryObesity = familyHistoryObesity; }
	
	public String getOccupation() { return occupation; }
	public void setOccupation(String occupation) { this.occupation = occupation; }
	
	public Boolean getExposureToToxins() { return exposureToToxins; }
	public void setExposureToToxins(Boolean exposureToToxins) { this.exposureToToxins = exposureToToxins; }
	
	public String getAirQualityIndex() { return airQualityIndex; }
	public void setAirQualityIndex(String airQualityIndex) { this.airQualityIndex = airQualityIndex; }
	
	public String getSocialConnections() { return socialConnections; }
	public void setSocialConnections(String socialConnections) { this.socialConnections = socialConnections; }
	
	public LocalDateTime getHealthProfileUpdatedAt() { return healthProfileUpdatedAt; }
	public void setHealthProfileUpdatedAt(LocalDateTime healthProfileUpdatedAt) { this.healthProfileUpdatedAt = healthProfileUpdatedAt; }

	public Patient(Long id, @NotBlank(message = "First name is required") String firstName,
			@NotBlank(message = "Last name is required") String lastName,
			@Email(message = "Email should be valid") String email, String phoneNumber,
			@NotNull(message = "Date of birth is required") LocalDate dateOfBirth, Gender gender, String address,
			String city, String state, String zipCode, String country, String bloodGroup, String allergies,
			String medicalHistory, String emergencyContactName, String emergencyContactPhone, LocalDateTime createdAt,
			LocalDateTime updatedAt, List<MedicalRecord> medicalRecords, List<Appointment> appointments) {
		super();
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.dateOfBirth = dateOfBirth;
		this.gender = gender;
		this.address = address;
		this.city = city;
		this.state = state;
		this.zipCode = zipCode;
		this.country = country;
		this.bloodGroup = bloodGroup;
		this.allergies = allergies;
		this.medicalHistory = medicalHistory;
		this.emergencyContactName = emergencyContactName;
		this.emergencyContactPhone = emergencyContactPhone;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.medicalRecords = medicalRecords;
		this.appointments = appointments;
	}

	public Patient() {
		// TODO Auto-generated constructor stub
	}

	
}

