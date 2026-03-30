package com.medicalai.dto;

import com.medicalai.entity.Prescription;
import com.medicalai.entity.Prescription.PrescriptionStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


public class PrescriptionDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String medicationName;
    private String dosage;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private String instructions;
    private String doctorName;
    private String notes;
    private Prescription.PrescriptionStatus status;
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
	public String getMedicationName() {
		return medicationName;
	}
	public void setMedicationName(String medicationName) {
		this.medicationName = medicationName;
	}
	public String getDosage() {
		return dosage;
	}
	public void setDosage(String dosage) {
		this.dosage = dosage;
	}
	public String getFrequency() {
		return frequency;
	}
	public void setFrequency(String frequency) {
		this.frequency = frequency;
	}
	public LocalDate getStartDate() {
		return startDate;
	}
	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}
	public LocalDate getEndDate() {
		return endDate;
	}
	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}
	public String getInstructions() {
		return instructions;
	}
	public void setInstructions(String instructions) {
		this.instructions = instructions;
	}
	public String getDoctorName() {
		return doctorName;
	}
	public void setDoctorName(String doctorName) {
		this.doctorName = doctorName;
	}
	public String getNotes() {
		return notes;
	}
	public void setNotes(String notes) {
		this.notes = notes;
	}
	public Prescription.PrescriptionStatus getStatus() {
		return status;
	}
	public void setStatus(Prescription.PrescriptionStatus status) {
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
	public PrescriptionDTO(Long id, Long patientId, String patientName, String medicationName, String dosage,
			String frequency, LocalDate startDate, LocalDate endDate, String instructions, String doctorName,
			String notes, PrescriptionStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.patientId = patientId;
		this.patientName = patientName;
		this.medicationName = medicationName;
		this.dosage = dosage;
		this.frequency = frequency;
		this.startDate = startDate;
		this.endDate = endDate;
		this.instructions = instructions;
		this.doctorName = doctorName;
		this.notes = notes;
		this.status = status;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	public PrescriptionDTO() {
		// TODO Auto-generated constructor stub
	}
    
}

