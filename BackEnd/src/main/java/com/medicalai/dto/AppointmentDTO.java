package com.medicalai.dto;

import com.medicalai.entity.Appointment;
import com.medicalai.entity.Appointment.AppointmentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AppointmentDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String doctorName;
    private String department;
    private LocalDateTime appointmentDate;
    private Appointment.AppointmentStatus status;
    private String reason;
    private String notes;
    private String location;
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
	public String getDoctorName() {
		return doctorName;
	}
	public void setDoctorName(String doctorName) {
		this.doctorName = doctorName;
	}
	public String getDepartment() {
		return department;
	}
	public void setDepartment(String department) {
		this.department = department;
	}
	public LocalDateTime getAppointmentDate() {
		return appointmentDate;
	}
	public void setAppointmentDate(LocalDateTime appointmentDate) {
		this.appointmentDate = appointmentDate;
	}
	public Appointment.AppointmentStatus getStatus() {
		return status;
	}
	public void setStatus(Appointment.AppointmentStatus status) {
		this.status = status;
	}
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	public String getNotes() {
		return notes;
	}
	public void setNotes(String notes) {
		this.notes = notes;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
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
	public AppointmentDTO(Long id, Long patientId, String patientName, String doctorName, String department,
			LocalDateTime appointmentDate, AppointmentStatus status, String reason, String notes, String location,
			LocalDateTime createdAt, LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.patientId = patientId;
		this.patientName = patientName;
		this.doctorName = doctorName;
		this.department = department;
		this.appointmentDate = appointmentDate;
		this.status = status;
		this.reason = reason;
		this.notes = notes;
		this.location = location;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	public AppointmentDTO() {
		
		// TODO Auto-generated constructor stub
	}
    
}

