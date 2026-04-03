package com.medicalai.service;

import com.medicalai.entity.Patient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Twilio SMS Service - ROBUST IMPLEMENTATION
 * 
 * Sends emergency SMS alerts using Twilio API with:
 * - Retry logic (3 attempts with exponential backoff)
 * - Connection timeout handling
 * - Detailed error logging
 * 
 * WHY: SMS is more reliable than email in emergencies - 
 * reaches the person immediately even without internet.
 */
@Service
public class TwilioSMSService {

    private static final Logger logger = LoggerFactory.getLogger(TwilioSMSService.class);

    // Twilio credentials - UPDATED 2026-01-11
    private static final String TWILIO_ACCOUNT_SID = "";
    private static final String TWILIO_AUTH_TOKEN = "";
    private static final String TWILIO_FROM_NUMBER = "+14199304228";
    
    // Emergency contact phone number
    private static final String EMERGENCY_PHONE_NUMBER = "+917359544351";
    
    // Retry configuration
    private static final int MAX_RETRIES = 3;
    private static final int INITIAL_BACKOFF_MS = 500;

    /**
     * Send emergency SMS alert with retry logic
     * 
     * @param patient The patient who triggered the emergency
     * @param latitude GPS latitude
     * @param longitude GPS longitude
     * @param eventType Type of emergency
     * @param isDemoMode Whether this is a test/demo
     * @return true if SMS sent successfully, false otherwise
     */
    public boolean sendEmergencySMS(Patient patient, Double latitude, Double longitude, 
                                   String eventType, Boolean isDemoMode) {
        long startTime = System.currentTimeMillis();
        logger.info("📱 [SMS] Starting emergency SMS send to: {}", EMERGENCY_PHONE_NUMBER);
        
        try {
            // Build SMS message
            String message = buildEmergencySMSMessage(patient, latitude, longitude, eventType, isDemoMode);
            logger.info("📝 [SMS] Message built ({} chars)", message.length());
            
            // Send via Twilio with retry logic
            boolean success = sendTwilioSMSWithRetry(EMERGENCY_PHONE_NUMBER, message);
            
            long duration = System.currentTimeMillis() - startTime;
            if (success) {
                logger.info("✅ [SMS] SUCCESS - Emergency SMS sent to {} in {}ms", EMERGENCY_PHONE_NUMBER, duration);
            } else {
                logger.error("❌ [SMS] FAILED - Could not send SMS to {} after {} retries ({}ms)", 
                            EMERGENCY_PHONE_NUMBER, MAX_RETRIES, duration);
            }
            
            return success;
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            logger.error("❌ [SMS] EXCEPTION after {}ms: {} - {}", duration, e.getClass().getSimpleName(), e.getMessage());
            return false;
        }
    }

    /**
     * Build emergency SMS message
     * 
     * WHY: SMS has 160 char limit, so we need to be concise but include critical info
     */
    private String buildEmergencySMSMessage(Patient patient, Double latitude, Double longitude, 
                                           String eventType, Boolean isDemoMode) {
        StringBuilder msg = new StringBuilder();
        
        // Emergency header
        if (isDemoMode) {
            msg.append("⚠️ [DEMO] ");
        } else {
            msg.append("🚨 EMERGENCY: ");
        }
        
        msg.append("Fall Detected!\n\n");
        
        // Patient name (essential)
        msg.append("Patient: ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("\n");
        
        // Phone number (essential for contact)
        if (patient.getPhoneNumber() != null && !patient.getPhoneNumber().isEmpty()) {
            msg.append("Phone: ").append(patient.getPhoneNumber()).append("\n");
        }
        
        // Email (essential for contact)
        if (patient.getEmail() != null && !patient.getEmail().isEmpty()) {
            msg.append("Email: ").append(patient.getEmail()).append("\n");
        }
        
        // Location (critical for emergency response)
        if (latitude != null && longitude != null && latitude != 0.0 && longitude != 0.0) {
            msg.append("\nLocation: https://maps.google.com/?q=").append(latitude).append(",").append(longitude);
        }
        
        return msg.toString();
    }

    /**
     * Send SMS via Twilio API with retry logic
     * 
     * Uses exponential backoff: 500ms, 1000ms, 2000ms
     */
    private boolean sendTwilioSMSWithRetry(String toNumber, String message) {
        int attempt = 0;
        int backoffMs = INITIAL_BACKOFF_MS;
        
        while (attempt < MAX_RETRIES) {
            attempt++;
            logger.info("📤 [SMS] Attempt {}/{} - Sending to Twilio...", attempt, MAX_RETRIES);
            
            try {
                boolean success = sendTwilioSMS(toNumber, message);
                if (success) {
                    return true;
                }
                
                // If not successful but no exception, wait and retry
                if (attempt < MAX_RETRIES) {
                    logger.warn("⏳ [SMS] Attempt {} failed, retrying in {}ms...", attempt, backoffMs);
                    Thread.sleep(backoffMs);
                    backoffMs *= 2; // Exponential backoff
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.error("❌ [SMS] Retry interrupted");
                return false;
            } catch (Exception e) {
                logger.error("❌ [SMS] Attempt {} exception: {} - {}", attempt, e.getClass().getSimpleName(), e.getMessage());
                
                if (attempt < MAX_RETRIES) {
                    try {
                        logger.warn("⏳ [SMS] Retrying in {}ms...", backoffMs);
                        Thread.sleep(backoffMs);
                        backoffMs *= 2;
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return false;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * Send SMS via Twilio API (single attempt)
     * 
     * Uses HTTP POST to Twilio Messages endpoint
     * WHY: Direct HTTP call instead of SDK to minimize dependencies
     */
    private boolean sendTwilioSMS(String toNumber, String message) {
        HttpURLConnection connection = null;
        try {
            String twilioUrl = "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_ACCOUNT_SID + "/Messages.json";
            
            URL url = new URL(twilioUrl);
            connection = (HttpURLConnection) url.openConnection();
            
            // Set up connection with optimized timeouts
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setConnectTimeout(10000); // 10 second connection timeout
            connection.setReadTimeout(10000); // 10 second read timeout
            
            // Set authentication header (Basic Auth)
            String auth = TWILIO_ACCOUNT_SID + ":" + TWILIO_AUTH_TOKEN;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            connection.setRequestProperty("Authorization", "Basic " + encodedAuth);
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            
            // Build POST data
            String postData = "To=" + URLEncoder.encode(toNumber, StandardCharsets.UTF_8.toString()) +
                             "&From=" + URLEncoder.encode(TWILIO_FROM_NUMBER, StandardCharsets.UTF_8.toString()) +
                             "&Body=" + URLEncoder.encode(message, StandardCharsets.UTF_8.toString());
            
            // Send request
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = postData.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
                os.flush();
            }
            
            // Get response
            int responseCode = connection.getResponseCode();
            logger.info("📥 [SMS] Twilio Response: {}", responseCode);
            
            if (responseCode == 200 || responseCode == 201) {
                // Read success response for confirmation
                try (java.io.BufferedReader br = new java.io.BufferedReader(
                        new java.io.InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        response.append(line);
                    }
                    // Check if response contains SID (successful send)
                    if (response.toString().contains("\"sid\"")) {
                        logger.info("✅ [SMS] Twilio confirmed send (SID received)");
                        return true;
                    }
                }
                return true;
            } else {
                // Read and log error response
                if (connection.getErrorStream() != null) {
                    try (java.io.BufferedReader br = new java.io.BufferedReader(
                            new java.io.InputStreamReader(connection.getErrorStream(), StandardCharsets.UTF_8))) {
                        StringBuilder response = new StringBuilder();
                        String responseLine;
                        while ((responseLine = br.readLine()) != null) {
                            response.append(responseLine.trim());
                        }
                        logger.error("❌ [SMS] Twilio Error {}: {}", responseCode, response.toString());
                    }
                }
                return false;
            }
            
        } catch (java.net.SocketTimeoutException e) {
            logger.error("❌ [SMS] Connection timeout: {}", e.getMessage());
            return false;
        } catch (java.net.ConnectException e) {
            logger.error("❌ [SMS] Connection failed: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("❌ [SMS] Error: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            return false;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
