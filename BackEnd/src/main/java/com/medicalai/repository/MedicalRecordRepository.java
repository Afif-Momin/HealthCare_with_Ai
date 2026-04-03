package com.medicalai.repository;

import com.medicalai.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientId(Long patientId);
    List<MedicalRecord> findByPatientIdAndRecordType(Long patientId, String recordType);
    List<MedicalRecord> findByPatientIdOrderByRecordDateAsc(Long patientId);
}

