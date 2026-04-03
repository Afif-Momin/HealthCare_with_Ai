package com.medicalai.service;

import com.medicalai.dto.MedicalRecordDTO;
import com.medicalai.entity.MedicalRecord;
import com.medicalai.entity.Patient;
import com.medicalai.exception.ResourceNotFoundException;
import com.medicalai.repository.MedicalRecordRepository;
import com.medicalai.repository.PatientRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientRepository patientRepository;

    public MedicalRecordDTO createMedicalRecord(MedicalRecordDTO recordDTO) {
        Patient patient = patientRepository.findById(recordDTO.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", recordDTO.getPatientId()));

        MedicalRecord record = new MedicalRecord();
        BeanUtils.copyProperties(recordDTO, record);
        record.setPatient(patient);

        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        return convertToDTO(savedRecord);
    }

    public MedicalRecordDTO getMedicalRecordById(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", id));
        return convertToDTO(record);
    }

    public List<MedicalRecordDTO> getAllMedicalRecords() {
        return medicalRecordRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDTO> getMedicalRecordsByPatientId(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDTO> getMedicalRecordsByPatientIdAndType(Long patientId, String recordType) {
        return medicalRecordRepository.findByPatientIdAndRecordType(patientId, recordType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MedicalRecordDTO updateMedicalRecord(Long id, MedicalRecordDTO recordDTO) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", id));

        record.setRecordType(recordDTO.getRecordType());
        record.setTitle(recordDTO.getTitle());
        record.setDescription(recordDTO.getDescription());
        record.setDiagnosis(recordDTO.getDiagnosis());
        record.setSymptoms(recordDTO.getSymptoms());
        record.setTreatment(recordDTO.getTreatment());
        record.setNotes(recordDTO.getNotes());
        record.setDoctorName(recordDTO.getDoctorName());
        record.setHospitalName(recordDTO.getHospitalName());
        record.setFileUrl(recordDTO.getFileUrl());
        record.setRecordDate(recordDTO.getRecordDate());

        MedicalRecord updatedRecord = medicalRecordRepository.save(record);
        return convertToDTO(updatedRecord);
    }

    public void deleteMedicalRecord(Long id) {
        if (!medicalRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("MedicalRecord", id);
        }
        medicalRecordRepository.deleteById(id);
    }

    private MedicalRecordDTO convertToDTO(MedicalRecord record) {
        MedicalRecordDTO dto = new MedicalRecordDTO();
        BeanUtils.copyProperties(record, dto);
        dto.setPatientId(record.getPatient().getId());
        dto.setPatientName(record.getPatient().getFirstName() + " " + record.getPatient().getLastName());
        return dto;
    }
}

