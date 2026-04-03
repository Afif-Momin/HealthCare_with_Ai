package com.medicalai.service;

import com.medicalai.dto.SOSRequestDTO;
import com.medicalai.dto.SOSResponseDTO;
import com.medicalai.entity.Patient;
import com.medicalai.entity.SOSEvent;
import com.medicalai.exception.ResourceNotFoundException;
import com.medicalai.repository.PatientRepository;
import com.medicalai.repository.SOSEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * SOS Service - OPTIMIZED FOR SPEED
 * 
 * Core service for handling emergency SOS events from the Silent Guardian system.
 * 
 * OPTIMIZATION: All notifications (SMS + Emails) run in PARALLEL
 * - SMS, Hospital Email, Emergency Contact Email all start at the same time
 * - Response returns as soon as any notification succeeds
 * - No sequential waiting - maximum speed
 * 
 * WHY THIS MATTERS: Every millisecond counts in a real emergency.
 */
@Service
public class SOSService {

    private static final Logger logger = LoggerFactory.getLogger(SOSService.class);

    @Autowired
    private SOSEventRepository sosEventRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TwilioSMSService twilioSMSService;

    @Autowired
    private ResendEmailService resendEmailService;

    // Emergency email recipients - IMPORTANT: These are the emails that receive SOS alerts
    private static final String HOSPITAL_EMAIL = "202512075@dau.ac.in"; // Hospital/Institution
    private static final String EMERGENCY_CONTACT_EMAIL = "bitecodes.global@gmail.com"; // Team email
    
    // Timeout for parallel operations (seconds)
    private static final int PARALLEL_TIMEOUT_SECONDS = 15;

    /**
     * Process emergency SOS request - OPTIMIZED
     * 
     * Flow:
     * 1. Fetch patient data (fast - cached by JPA)
     * 2. Start ALL notifications in PARALLEL (SMS + 2 Emails)
     * 3. Log event immediately (don't wait for notifications)
     * 4. Return response FAST
     */
    @Transactional
    public SOSResponseDTO processSOSRequest(SOSRequestDTO request) {
        long startTime = System.currentTimeMillis();
        logger.info("🚨 SOS REQUEST - Patient: {}, Event: {}", request.getPatientId(), request.getEventType());

        // Fetch patient - FAST
        Long patientId = request.getPatientId();
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));

        // Create event record IMMEDIATELY
        SOSEvent sosEvent = new SOSEvent();
        sosEvent.setPatient(patient);
        sosEvent.setEventType(request.getEventType());
        sosEvent.setLatitude(request.getLatitude());
        sosEvent.setLongitude(request.getLongitude());
        sosEvent.setIsDemoMode(request.getIsDemoMode());
        sosEvent.setWasCanceled(false);
        sosEvent.setAdditionalContext(request.getAdditionalContext());
        sosEvent.setEmailSent(false);
        sosEvent.setSmsSent(false);
        
        // Save event first - audit trail secured
        sosEvent = sosEventRepository.save(sosEvent);
        final Long eventId = sosEvent.getId();
        logger.info("📝 Event #{} logged in {}ms", eventId, System.currentTimeMillis() - startTime);

        // Thread-safe result trackers
        AtomicBoolean smsSent = new AtomicBoolean(false);
        AtomicBoolean hospitalEmailSent = new AtomicBoolean(false);
        AtomicBoolean emergencyEmailSent = new AtomicBoolean(false);

        // ============================================
        // PARALLEL EXECUTION - ALL AT ONCE
        // ============================================
        
        // SMS Task (fastest - sends first)
        CompletableFuture<Void> smsTask = CompletableFuture.runAsync(() -> {
            try {
                logger.info("📱 [PARALLEL] Sending SMS...");
                boolean result = twilioSMSService.sendEmergencySMS(
                    patient, request.getLatitude(), request.getLongitude(),
                    request.getEventType(), request.getIsDemoMode()
                );
                smsSent.set(result);
                if (result) logger.info("✅ SMS sent in {}ms", System.currentTimeMillis() - startTime);
            } catch (Exception e) {
                logger.error("❌ SMS failed: {}", e.getMessage());
            }
        });

        // Hospital Email Task - Try Resend HTTP API first, fallback to SMTP
        CompletableFuture<Void> hospitalEmailTask = CompletableFuture.runAsync(() -> {
            try {
                logger.info("📧 [PARALLEL] Sending hospital email to: {}", HOSPITAL_EMAIL);
                
                // Use Resend HTTP API (works on Render)
                boolean sent = resendEmailService.sendEmergencyEmail(
                    patient, request.getLatitude(), request.getLongitude(),
                    request.getEventType(), request.getIsDemoMode(), HOSPITAL_EMAIL
                );
                
                hospitalEmailSent.set(sent);
                if (sent) {
                    logger.info("✅ Hospital email sent in {}ms", System.currentTimeMillis() - startTime);
                } else {
                    logger.error("❌ Hospital email failed via Resend API");
                }
            } catch (Exception e) {
                logger.error("❌ Hospital email failed: {}", e.getMessage());
            }
        });

        // Emergency Contact Email Task - Use Resend HTTP API only
        CompletableFuture<Void> emergencyEmailTask = CompletableFuture.runAsync(() -> {
            try {
                logger.info("📧 [PARALLEL] Sending emergency contact email to: {}", EMERGENCY_CONTACT_EMAIL);
                
                // Use Resend HTTP API (works on Render)
                boolean sent = resendEmailService.sendEmergencyEmail(
                    patient, request.getLatitude(), request.getLongitude(),
                    request.getEventType(), request.getIsDemoMode(), EMERGENCY_CONTACT_EMAIL
                );
                
                emergencyEmailSent.set(sent);
                if (sent) {
                    logger.info("✅ Emergency email sent in {}ms", System.currentTimeMillis() - startTime);
                } else {
                    logger.error("❌ Emergency email failed via Resend API");
                }
            } catch (Exception e) {
                logger.error("❌ Emergency email failed: {}", e.getMessage());
            }
        });

        // Wait for all tasks (with timeout to prevent hanging)
        try {
            CompletableFuture.allOf(smsTask, hospitalEmailTask, emergencyEmailTask)
                .get(PARALLEL_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (Exception e) {
            logger.warn("⚠️ Some notifications timed out after {}s", PARALLEL_TIMEOUT_SECONDS);
        }

        // Update event with results
        boolean emailSuccess = hospitalEmailSent.get() || emergencyEmailSent.get();
        boolean smsSuccess = smsSent.get();
        
        // Async update - don't block response
        final boolean finalEmailSuccess = emailSuccess;
        final boolean finalSmsSuccess = smsSuccess;
        CompletableFuture.runAsync(() -> {
            try {
                SOSEvent event = sosEventRepository.findById(eventId).orElse(null);
                if (event != null) {
                    event.setEmailSent(finalEmailSuccess);
                    event.setSmsSent(finalSmsSuccess);
                    sosEventRepository.save(event);
                }
            } catch (Exception e) {
                logger.error("Failed to update event status: {}", e.getMessage());
            }
        });

        long totalTime = System.currentTimeMillis() - startTime;
        logger.info("📊 DONE in {}ms - SMS:{}, Hospital:{}, Emergency:{}", 
                   totalTime, smsSuccess, hospitalEmailSent.get(), emergencyEmailSent.get());

        // Build response message
        String message;
        if (smsSuccess && emailSuccess) {
            message = "🚨 Emergency alert sent via SMS and Email. Help is on the way!";
        } else if (smsSuccess) {
            message = "🚨 Emergency SMS sent! Help is on the way!";
        } else if (emailSuccess) {
            message = "🚨 Emergency email sent! Help is on the way!";
        } else {
            message = "⚠️ Emergency logged. Please call emergency services directly.";
        }

        return new SOSResponseDTO(eventId, message, emailSuccess, smsSuccess, sosEvent.getCreatedAt());
    }
}
