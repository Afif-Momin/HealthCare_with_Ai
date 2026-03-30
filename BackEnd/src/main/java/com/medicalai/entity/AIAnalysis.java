package com.medicalai.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analyses")
public class AIAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Patient is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id")
    private MedicalRecord medicalRecord;

    @NotBlank(message = "Analysis type is required")
    @Column(nullable = false)
    private String analysisType; // e.g., "General Analysis", "Diabetes", "Heart Attack/ECG", "MRI/Tumor", "Blood Pressure", "TB", "Blood Report Analysis"

    @Column(columnDefinition = "TEXT")
    private String inputData; // Input data for AI analysis

    @Column(columnDefinition = "TEXT", nullable = false)
    private String analysisResult; // AI-generated result

    @Column(columnDefinition = "TEXT")
    private String confidenceScore; // Confidence level of the analysis

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(columnDefinition = "TEXT")
    private String modelVersion; // AI model version used

    @Column(columnDefinition = "TEXT")
    private String structuredReportJson; // Structured JSON report from AI

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnalysisStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = AnalysisStatus.COMPLETED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AnalysisStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Patient getPatient() {
		return patient;
	}

	public void setPatient(Patient patient) {
		this.patient = patient;
	}

	public MedicalRecord getMedicalRecord() {
		return medicalRecord;
	}

	public void setMedicalRecord(MedicalRecord medicalRecord) {
		this.medicalRecord = medicalRecord;
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

	public AnalysisStatus getStatus() {
		return status;
	}

	public void setStatus(AnalysisStatus status) {
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

	public AIAnalysis(Long id, @NotNull(message = "Patient is required") Patient patient, MedicalRecord medicalRecord,
			@NotBlank(message = "Analysis type is required") String analysisType, String inputData,
			String analysisResult, String confidenceScore, String recommendations, String modelVersion,
			AnalysisStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.patient = patient;
		this.medicalRecord = medicalRecord;
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

	public AIAnalysis() {
		
		// TODO Auto-generated constructor stub
	}
    
}

