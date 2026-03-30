package com.medicalai.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Patient is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotBlank(message = "Medication name is required")
    @Column(nullable = false)
    private String medicationName;

    @NotBlank(message = "Dosage is required")
    @Column(nullable = false)
    private String dosage;

    @NotBlank(message = "Frequency is required")
    @Column(nullable = false)
    private String frequency; // e.g., "Twice daily", "Once a day"

    @NotNull(message = "Start date is required")
    @Column(nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(nullable = false)
    private LocalDate endDate;

    private String instructions;
    private String doctorName;
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrescriptionStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = PrescriptionStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PrescriptionStatus {
        ACTIVE, COMPLETED, CANCELLED
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

	public PrescriptionStatus getStatus() {
		return status;
	}

	public void setStatus(PrescriptionStatus status) {
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

	public Prescription(Long id, @NotNull(message = "Patient is required") Patient patient,
			@NotBlank(message = "Medication name is required") String medicationName,
			@NotBlank(message = "Dosage is required") String dosage,
			@NotBlank(message = "Frequency is required") String frequency,
			@NotNull(message = "Start date is required") LocalDate startDate,
			@NotNull(message = "End date is required") LocalDate endDate, String instructions, String doctorName,
			String notes, PrescriptionStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.patient = patient;
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

	public Prescription() {
		// TODO Auto-generated constructor stub
	}
    
}

