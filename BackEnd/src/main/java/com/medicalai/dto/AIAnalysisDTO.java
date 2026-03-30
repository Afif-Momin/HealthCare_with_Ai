package com.medicalai.dto;

import com.medicalai.entity.AIAnalysis;
import com.medicalai.entity.AIAnalysis.AnalysisStatus;

import java.time.LocalDateTime;


public class AIAnalysisDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long medicalRecordId;
    private String analysisType;
    private String inputData;
    private String analysisResult;
    private String confidenceScore;
    private String recommendations;
    private String modelVersion;
    private AIAnalysis.AnalysisStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String structuredReportJson; // Structured JSON report from AI
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getPatientId() {
		return patientId;
	}
	public void setPatientId(Long patientId) {
		this.patientId = patientId;
	}
	public String getPatientName() {
		return patientName;
	}
	public void setPatientName(String patientName) {
		this.patientName = patientName;
	}
	public Long getMedicalRecordId() {
		return medicalRecordId;
	}
	public void setMedicalRecordId(Long medicalRecordId) {
		this.medicalRecordId = medicalRecordId;
	}
	public String getAnalysisType() {
		return analysisType;
	}
	public void setAnalysisType(String analysisType) {
		this.analysisType = analysisType;
	}
	public String getInputData() {
		return inputData;
	}
	public void setInputData(String inputData) {
		this.inputData = inputData;
	}
	public String getAnalysisResult() {
		return analysisResult;
	}
	public void setAnalysisResult(String analysisResult) {
		this.analysisResult = analysisResult;
	}
	public String getConfidenceScore() {
		return confidenceScore;
	}
	public void setConfidenceScore(String confidenceScore) {
		this.confidenceScore = confidenceScore;
	}
	public String getRecommendations() {
		return recommendations;
	}
	public void setRecommendations(String recommendations) {
		this.recommendations = recommendations;
	}
	public String getModelVersion() {
		return modelVersion;
	}
	public void setModelVersion(String modelVersion) {
		this.modelVersion = modelVersion;
	}
	public AIAnalysis.AnalysisStatus getStatus() {
		return status;
	}
	public void setStatus(AIAnalysis.AnalysisStatus status) {
		this.status = status;
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
	public String getStructuredReportJson() {
		return structuredReportJson;
	}
	public void setStructuredReportJson(String structuredReportJson) {
		this.structuredReportJson = structuredReportJson;
	}
	public AIAnalysisDTO(Long id, Long patientId, String patientName, Long medicalRecordId, String analysisType,
			String inputData, String analysisResult, String confidenceScore, String recommendations,
			String modelVersion, AnalysisStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.patientId = patientId;
		this.patientName = patientName;
		this.medicalRecordId = medicalRecordId;
		this.analysisType = analysisType;
		this.inputData = inputData;
		this.analysisResult = analysisResult;
		this.confidenceScore = confidenceScore;
		this.recommendations = recommendations;
		this.modelVersion = modelVersion;
		this.status = status;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	public AIAnalysisDTO() {
		
	}
    
}

