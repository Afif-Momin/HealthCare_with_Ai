package com.medicalai.controller;

import com.medicalai.dto.MedicalRecordDTO;
import com.medicalai.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<MedicalRecordDTO> createMedicalRecord(@Valid @RequestBody MedicalRecordDTO recordDTO) {
        MedicalRecordDTO createdRecord = medicalRecordService.createMedicalRecord(recordDTO);
        return new ResponseEntity<>(createdRecord, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecordDTO> getMedicalRecordById(@PathVariable Long id) {
        MedicalRecordDTO record = medicalRecordService.getMedicalRecordById(id);
        return ResponseEntity.ok(record);
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecordDTO>> getAllMedicalRecords(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String recordType) {
        List<MedicalRecordDTO> records;
        if (patientId != null && recordType != null) {
            records = medicalRecordService.getMedicalRecordsByPatientIdAndType(patientId, recordType);
        } else if (patientId != null) {
            records = medicalRecordService.getMedicalRecordsByPatientId(patientId);
        } else {
            records = medicalRecordService.getAllMedicalRecords();
        }
        return ResponseEntity.ok(records);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecordDTO> updateMedicalRecord(
            @PathVariable Long id,
            @Valid @RequestBody MedicalRecordDTO recordDTO) {
        MedicalRecordDTO updatedRecord = medicalRecordService.updateMedicalRecord(id, recordDTO);
        return ResponseEntity.ok(updatedRecord);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long id) {
        medicalRecordService.deleteMedicalRecord(id);
        return ResponseEntity.noContent().build();
    }
}

