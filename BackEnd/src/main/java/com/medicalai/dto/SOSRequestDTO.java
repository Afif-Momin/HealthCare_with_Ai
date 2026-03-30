package com.medicalai.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

/**
 * SOS Request DTO
 * 
 * This DTO represents the emergency SOS request sent from the mobile app
 * when a fall is detected and the countdown expires (or manual trigger).
 * 
 * WHY: Separates API contract from entity, allows validation, and provides
 * a clean interface for the mobile app to send emergency data.
 */
public class SOSRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Event type is required")
    private String eventType; // "FALL_DETECTED", "MANUAL_SOS"

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    /**
     * Whether this is a demo/test trigger
     * Backend uses this to mark the event appropriately in logs
     */
    @NotNull(message = "Demo mode flag is required")
    private Boolean isDemoMode;

    /**
     * Additional context from the mobile app
     * Can include sensor readings, detection confidence, etc.
     */
    private String additionalContext;

    // Constructors
    public SOSRequestDTO() {
    }

    public SOSRequestDTO(Long patientId, String eventType, Double latitude, 
                        Double longitude, Boolean isDemoMode, String additionalContext) {
        this.patientId = patientId;
        this.eventType = eventType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isDemoMode = isDemoMode;
        this.additionalContext = additionalContext;
    }

    // Getters and Setters
    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
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

    public String getAdditionalContext() {
        return additionalContext;
    }

    public void setAdditionalContext(String additionalContext) {
        this.additionalContext = additionalContext;
    }
}
