package com.medicalai.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * SOS Event Entity
 * 
 * This entity logs all emergency SOS events triggered by the Silent Guardian
 * fall detection system. Each event represents a potential life-threatening
 * situation where automatic emergency response was activated.
 * 
 * WHY: Audit trail is critical for:
 * - Demonstrating system reliability to judges
 * - Post-incident analysis
 * - Legal compliance
 * - Improving detection algorithms
 */
@Entity
@Table(name = "sos_events")
public class SOSEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Patient is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    /**
     * Event type - Currently "FALL_DETECTED" but extensible for future
     * emergency types (heart attack, stroke detection, etc.)
     */
    @Column(nullable = false)
    private String eventType; // "FALL_DETECTED", "MANUAL_SOS", etc.

    /**
     * GPS coordinates at time of emergency
     * Critical for first responders to locate the patient
     */
    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    /**
     * Whether this was triggered by actual sensor detection or demo mode
     * Important for distinguishing real emergencies from test scenarios
     */
    @Column(nullable = false)
    private Boolean isDemoMode;

    /**
     * Whether the emergency was canceled by the user
     * If true, no actual emergency services were contacted
     */
    @Column(nullable = false)
    private Boolean wasCanceled;

    /**
     * Whether emergency email was successfully sent
     * Critical for ensuring help actually gets notified
     */
    @Column(nullable = false)
    private Boolean emailSent;

    /**
     * Whether emergency SMS was successfully sent via Twilio
     * SMS reaches faster than email and works without internet
     */
    @Column(nullable = true)
    private Boolean smsSent;

    /**
     * Additional context about the emergency
     * Can include sensor data, user state, etc.
     */
    @Column(columnDefinition = "TEXT")
    private String additionalContext;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public SOSEvent() {
    }

    public SOSEvent(Patient patient, String eventType, Double latitude, Double longitude, 
                   Boolean isDemoMode, Boolean wasCanceled, Boolean emailSent) {
        this.patient = patient;
        this.eventType = eventType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isDemoMode = isDemoMode;
        this.wasCanceled = wasCanceled;
        this.emailSent = emailSent;
    }

    // Getters and Setters
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

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Boolean getIsDemoMode() {
        return isDemoMode;
    }

    public void setIsDemoMode(Boolean isDemoMode) {
        this.isDemoMode = isDemoMode;
    }

    public Boolean getWasCanceled() {
        return wasCanceled;
    }

    public void setWasCanceled(Boolean wasCanceled) {
        this.wasCanceled = wasCanceled;
    }

    public Boolean getEmailSent() {
        return emailSent;
    }

    public void setEmailSent(Boolean emailSent) {
        this.emailSent = emailSent;
    }

    public String getAdditionalContext() {
        return additionalContext;
    }

    public void setAdditionalContext(String additionalContext) {
        this.additionalContext = additionalContext;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getSmsSent() {
        return smsSent;
    }

    public void setSmsSent(Boolean smsSent) {
        this.smsSent = smsSent;
    }
}
