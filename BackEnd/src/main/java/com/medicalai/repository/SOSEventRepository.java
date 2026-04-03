package com.medicalai.repository;

import com.medicalai.entity.SOSEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for SOS Event entities
 * 
 * WHY: Provides data access layer for emergency event logging
 * Enables querying historical emergency events for analytics and audit
 */
@Repository
public interface SOSEventRepository extends JpaRepository<SOSEvent, Long> {
    
    /**
     * Find all SOS events for a specific patient
     * Useful for showing emergency history in patient profile
     */
    List<SOSEvent> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    
    /**
     * Find all non-demo SOS events (real emergencies)
     * Important for distinguishing actual emergencies from test scenarios
     */
    List<SOSEvent> findByIsDemoModeFalseOrderByCreatedAtDesc();
}
