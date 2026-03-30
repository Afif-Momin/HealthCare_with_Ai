package com.medicalai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public class AIAnalysisRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long medicalRecordId; // Single record (for backward compatibility)
    
    private java.util.List<Long> medicalRecordIds; // Multiple records

    @NotBlank(message = "Analysis type is required")
    private String analysisType;

    @NotBlank(message = "Input data is required")
    private String inputData;

    private String modelVersion;

	public Long getPatientId() {
		return patientId;
	}

	public void setPatientId(Long patientId) {
		this.patientId = patientId;
	}

	public Long getMedicalRecordId() {
		return medicalRecordId;
	}

	public void setMedicalRecordId(Long medicalRecordId) {
		this.medicalRecordId = medicalRecordId;
	}

	public java.util.List<Long> getMedicalRecordIds() {
		return medicalRecordIds;
	}

	public void setMedicalRecordIds(java.util.List<Long> medicalRecordIds) {
		this.medicalRecordIds = medicalRecordIds;
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

	public String getModelVersion() {
		return modelVersion;
	}

	public void setModelVersion(String modelVersion) {
		this.modelVersion = modelVersion;
	}

	public AIAnalysisRequest(@NotNull(message = "Patient ID is required") Long patientId, Long medicalRecordId,
			@NotBlank(message = "Analysis type is required") String analysisType,
			@NotBlank(message = "Input data is required") String inputData, String modelVersion) {
		super();
		this.patientId = patientId;
		this.medicalRecordId = medicalRecordId;
		this.analysisType = analysisType;
		this.inputData = inputData;
		this.modelVersion = modelVersion;
	}

	public AIAnalysisRequest() {
	
		// TODO Auto-generated constructor stub
	}
    
}

