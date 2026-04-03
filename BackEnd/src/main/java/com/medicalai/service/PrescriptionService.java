package com.medicalai.service;

import com.medicalai.dto.PrescriptionDTO;
import com.medicalai.entity.Prescription;
import com.medicalai.entity.Patient;
import com.medicalai.exception.ResourceNotFoundException;
import com.medicalai.repository.PrescriptionRepository;
import com.medicalai.repository.PatientRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    public PrescriptionDTO createPrescription(PrescriptionDTO prescriptionDTO) {
        Patient patient = patientRepository.findById(prescriptionDTO.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", prescriptionDTO.getPatientId()));

        Prescription prescription = new Prescription();
        BeanUtils.copyProperties(prescriptionDTO, prescription);
        prescription.setPatient(patient);

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        return convertToDTO(savedPrescription);
    }

    public PrescriptionDTO getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", id));
        return convertToDTO(prescription);
    }

    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getActivePrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientIdAndStatus(patientId, Prescription.PrescriptionStatus.ACTIVE).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO updatePrescription(Long id, PrescriptionDTO prescriptionDTO) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", id));

        prescription.setMedicationName(prescriptionDTO.getMedicationName());
        prescription.setDosage(prescriptionDTO.getDosage());
        prescription.setFrequency(prescriptionDTO.getFrequency());
        prescription.setStartDate(prescriptionDTO.getStartDate());
        prescription.setEndDate(prescriptionDTO.getEndDate());
        prescription.setInstructions(prescriptionDTO.getInstructions());
        prescription.setDoctorName(prescriptionDTO.getDoctorName());
        prescription.setNotes(prescriptionDTO.getNotes());
        prescription.setStatus(prescriptionDTO.getStatus());

        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return convertToDTO(updatedPrescription);
    }

    public void deletePrescription(Long id) {
        if (!prescriptionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Prescription", id);
        }
        prescriptionRepository.deleteById(id);
    }

    private PrescriptionDTO convertToDTO(Prescription prescription) {
        PrescriptionDTO dto = new PrescriptionDTO();
        BeanUtils.copyProperties(prescription, dto);
        dto.setPatientId(prescription.getPatient().getId());
        dto.setPatientName(prescription.getPatient().getFirstName() + " " + prescription.getPatient().getLastName());
        return dto;
    }
}

