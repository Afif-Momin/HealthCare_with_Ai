package com.medicalai.service;

import com.medicalai.dto.PatientDTO;
import com.medicalai.entity.Patient;
import com.medicalai.exception.ResourceNotFoundException;
import com.medicalai.repository.PatientRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public PatientDTO createPatient(PatientDTO patientDTO) {
        Patient patient = new Patient();
        BeanUtils.copyProperties(patientDTO, patient);
        Patient savedPatient = patientRepository.save(patient);
        return convertToDTO(savedPatient);
    }

    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
        return convertToDTO(patient);
    }

    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PatientDTO> searchPatients(String searchTerm) {
        List<Patient> patients = patientRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(searchTerm, searchTerm);
        return patients.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PatientDTO updatePatient(Long id, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));

        // Basic Info
        patient.setFirstName(patientDTO.getFirstName());
        patient.setLastName(patientDTO.getLastName());
        patient.setEmail(patientDTO.getEmail());
        patient.setPhoneNumber(patientDTO.getPhoneNumber());
        patient.setDateOfBirth(patientDTO.getDateOfBirth());
        patient.setGender(patientDTO.getGender());
        patient.setAddress(patientDTO.getAddress());
        patient.setCity(patientDTO.getCity());
        patient.setState(patientDTO.getState());
        patient.setZipCode(patientDTO.getZipCode());
        patient.setCountry(patientDTO.getCountry());
        patient.setBloodGroup(patientDTO.getBloodGroup());
        patient.setAllergies(patientDTO.getAllergies());
        patient.setMedicalHistory(patientDTO.getMedicalHistory());
        patient.setEmergencyContactName(patientDTO.getEmergencyContactName());
        patient.setEmergencyContactPhone(patientDTO.getEmergencyContactPhone());
        
        // Health Profile - Body Measurements
        patient.setHeight(patientDTO.getHeight());
        patient.setWeight(patientDTO.getWeight());
        
        // Vital Signs & Biomarkers
        patient.setSystolicBP(patientDTO.getSystolicBP());
        patient.setDiastolicBP(patientDTO.getDiastolicBP());
        patient.setRestingHeartRate(patientDTO.getRestingHeartRate());
        patient.setTotalCholesterol(patientDTO.getTotalCholesterol());
        patient.setLdlCholesterol(patientDTO.getLdlCholesterol());
        patient.setHdlCholesterol(patientDTO.getHdlCholesterol());
        patient.setTriglycerides(patientDTO.getTriglycerides());
        patient.setFastingGlucose(patientDTO.getFastingGlucose());
        patient.setHba1c(patientDTO.getHba1c());
        
        // Lifestyle - Smoking
        patient.setSmoker(patientDTO.getSmoker());
        patient.setSmokingYears(patientDTO.getSmokingYears());
        patient.setCigarettesPerDay(patientDTO.getCigarettesPerDay());
        patient.setFormerSmoker(patientDTO.getFormerSmoker());
        patient.setYearsQuitSmoking(patientDTO.getYearsQuitSmoking());
        
        // Lifestyle - Alcohol
        patient.setAlcoholConsumption(patientDTO.getAlcoholConsumption());
        patient.setDrinksPerWeek(patientDTO.getDrinksPerWeek());
        
        // Lifestyle - Exercise
        patient.setExerciseHoursPerWeek(patientDTO.getExerciseHoursPerWeek());
        patient.setExerciseIntensity(patientDTO.getExerciseIntensity());
        patient.setSedentaryHoursPerDay(patientDTO.getSedentaryHoursPerDay());
        
        // Lifestyle - Diet
        patient.setDiet(patientDTO.getDiet());
        patient.setDailyVegetableServings(patientDTO.getDailyVegetableServings());
        patient.setDailyFruitServings(patientDTO.getDailyFruitServings());
        patient.setProcessedFoodFrequency(patientDTO.getProcessedFoodFrequency());
        
        // Lifestyle - Sleep & Stress
        patient.setSleepHoursPerNight(patientDTO.getSleepHoursPerNight());
        patient.setSleepQuality(patientDTO.getSleepQuality());
        patient.setStressLevel(patientDTO.getStressLevel());
        
        // Medical Conditions
        patient.setDiabetic(patientDTO.getDiabetic());
        patient.setDiabetesType(patientDTO.getDiabetesType());
        patient.setOnBPMeds(patientDTO.getOnBPMeds());
        patient.setOnCholesterolMeds(patientDTO.getOnCholesterolMeds());
        patient.setOnDiabetesMeds(patientDTO.getOnDiabetesMeds());
        patient.setOtherMedications(patientDTO.getOtherMedications());
        
        // Past Medical Events
        patient.setHadHeartAttack(patientDTO.getHadHeartAttack());
        patient.setHadStroke(patientDTO.getHadStroke());
        patient.setHasChronicKidneyDisease(patientDTO.getHasChronicKidneyDisease());
        patient.setHasAutoImmuneDisorder(patientDTO.getHasAutoImmuneDisorder());
        patient.setHasArrhythmia(patientDTO.getHasArrhythmia());
        patient.setHasAnxiety(patientDTO.getHasAnxiety());
        patient.setHasDepression(patientDTO.getHasDepression());
        
        // Family History
        patient.setFamilyHistoryHeartDisease(patientDTO.getFamilyHistoryHeartDisease());
        patient.setFamilyHeartDiseaseAge(patientDTO.getFamilyHeartDiseaseAge());
        patient.setFamilyHistoryDiabetes(patientDTO.getFamilyHistoryDiabetes());
        patient.setFamilyHistoryStroke(patientDTO.getFamilyHistoryStroke());
        patient.setFamilyHistoryCancer(patientDTO.getFamilyHistoryCancer());
        patient.setFamilyCancerTypes(patientDTO.getFamilyCancerTypes());
        patient.setFamilyHistoryHypertension(patientDTO.getFamilyHistoryHypertension());
        patient.setFamilyHistoryObesity(patientDTO.getFamilyHistoryObesity());
        
        // Environment & Occupation
        patient.setOccupation(patientDTO.getOccupation());
        patient.setExposureToToxins(patientDTO.getExposureToToxins());
        patient.setAirQualityIndex(patientDTO.getAirQualityIndex());
        patient.setSocialConnections(patientDTO.getSocialConnections());
        
        // Update timestamp
        patient.setHealthProfileUpdatedAt(java.time.LocalDateTime.now());

        Patient updatedPatient = patientRepository.save(patient);
        return convertToDTO(updatedPatient);
    }

    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", id);
        }
        patientRepository.deleteById(id);
    }

    private PatientDTO convertToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        BeanUtils.copyProperties(patient, dto);
        return dto;
    }
}

