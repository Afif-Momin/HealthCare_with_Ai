package com.medicalai.repository;

import com.medicalai.entity.AIAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, Long> {
    List<AIAnalysis> findByPatientId(Long patientId);
    List<AIAnalysis> findByAnalysisType(String analysisType);
    List<AIAnalysis> findByStatus(AIAnalysis.AnalysisStatus status);
    List<AIAnalysis> findByPatientIdOrderByCreatedAtAsc(Long patientId);
    Optional<AIAnalysis> findTopByPatientIdOrderByCreatedAtDesc(Long patientId);
}

