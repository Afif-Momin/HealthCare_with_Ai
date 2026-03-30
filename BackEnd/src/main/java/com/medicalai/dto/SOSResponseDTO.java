package com.medicalai.dto;

import java.time.LocalDateTime;

/**
 * SOS Response DTO
 * 
 * Response sent back to mobile app after processing emergency request.
 * Confirms that emergency services have been notified.
 * 
 * WHY: Provides feedback to the user that help is on the way,
 * which is critical for emotional reassurance during a crisis.
 */
public class SOSResponseDTO {

    private Long eventId;
    private String message;
    private Boolean emailSent;
    private Boolean smsSent;
    private Boolean success; // Overall success indicator
    private LocalDateTime timestamp;

    public SOSResponseDTO() {
    }

    public SOSResponseDTO(Long eventId, String message, Boolean emailSent, LocalDateTime timestamp) {
        this.eventId = eventId;
        this.message = message;
        this.emailSent = emailSent;
        this.success = emailSent;
        this.timestamp = timestamp;
    }

    public SOSResponseDTO(Long eventId, String message, Boolean emailSent, Boolean smsSent, LocalDateTime timestamp) {
        this.eventId = eventId;
        this.message = message;
        this.emailSent = emailSent;
        this.smsSent = smsSent;
        this.success = emailSent || smsSent;
        this.timestamp = timestamp;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getEmailSent() {
        return emailSent;
    }

    public void setEmailSent(Boolean emailSent) {
        this.emailSent = emailSent;
    }

    public Boolean getSmsSent() {
        return smsSent;
    }

    public void setSmsSent(Boolean smsSent) {
        this.smsSent = smsSent;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
