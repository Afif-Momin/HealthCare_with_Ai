package com.medicalai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


public class MedicalRecordDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String recordType;
    private String title;
    private String description;
    private String diagnosis;
    private String symptoms;
    private String treatment;
    private String notes;
    private String doctorName;
    private String hospitalName;
    private String fileUrl;
    private LocalDateTime recordDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
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
	public String getRecordType() {
		return recordType;
	}
	public void setRecordType(String recordType) {
		this.recordType = recordType;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getDiagnosis() {
		return diagnosis;
	}
	public void setDiagnosis(String diagnosis) {
		this.diagnosis = diagnosis;
	}
	public String getSymptoms() {
		return symptoms;
	}
	public void setSymptoms(String symptoms) {
		this.symptoms = symptoms;
	}
	public String getTreatment() {
		return treatment;
	}
	public void setTreatment(String treatment) {
		this.treatment = treatment;
	}
	public String getNotes() {
		return notes;
	}
	public void setNotes(String notes) {
		this.notes = notes;
	}
	public String getDoctorName() {
		return doctorName;
	}
	public void setDoctorName(String doctorName) {
		this.doctorName = doctorName;
	}
	public String getHospitalName() {
		return hospitalName;
	}
	public void setHospitalName(String hospitalName) {
		this.hospitalName = hospitalName;
	}
	public String getFileUrl() {
		return fileUrl;
	}
	public void setFileUrl(String fileUrl) {
		this.fileUrl = fileUrl;
	}
	public LocalDateTime getRecordDate() {
		return recordDate;
	}
	public void setRecordDate(LocalDateTime recordDate) {
		this.recordDate = recordDate;
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
	public MedicalRecordDTO(Long id, Long patientId, String patientName, String recordType, String title,
			String description, String diagnosis, String symptoms, String treatment, String notes, String doctorName,
			String hospitalName, String fileUrl, LocalDateTime recordDate, LocalDateTime createdAt,
			LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.patientId = patientId;
		this.patientName = patientName;
		this.recordType = recordType;
		this.title = title;
		this.description = description;
		this.diagnosis = diagnosis;
		this.symptoms = symptoms;
		this.treatment = treatment;
		this.notes = notes;
		this.doctorName = doctorName;
		this.hospitalName = hospitalName;
		this.fileUrl = fileUrl;
		this.recordDate = recordDate;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	public MedicalRecordDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
    
    
}

