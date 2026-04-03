package com.medicalai.service;

import com.medicalai.entity.Patient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Resend Email Service
 * 
 * Uses Resend HTTP API to send emails - works on Render free tier!
 * SMTP is blocked on Render, but HTTP APIs work fine.
 * 
 * Free tier: 100 emails/day (perfect for hackathon demos)
 * 
 * To get API key: https://resend.com (sign up takes 2 minutes)
 */
@Service
public class ResendEmailService {

    private static final Logger logger = LoggerFactory.getLogger(ResendEmailService.class);

    @Value("${resend.api.key:re_placeholder}")
    private String apiKey;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    /**
     * Send emergency email via Resend HTTP API with retry logic
     * 
     * @return true if email sent successfully
     */
    public boolean sendEmergencyEmail(Patient patient, Double latitude, Double longitude,
                                      String eventType, Boolean isDemoMode, String recipientEmail) {
        
        // Check if API key is configured
        if (apiKey == null || apiKey.equals("re_placeholder") || apiKey.isEmpty()) {
            logger.warn("⚠️ [RESEND] API key not configured. Skipping HTTP email.");
            return false;
        }

        long startTime = System.currentTimeMillis();
        int maxRetries = 3;
        int backoffMs = 500;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.info("📧 [RESEND] Attempt {}/{} to: {}", attempt, maxRetries, recipientEmail);

                URL url = new URL(RESEND_API_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Authorization", "Bearer " + apiKey);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(15000); // 15 second connection timeout
                conn.setReadTimeout(15000);    // 15 second read timeout

                // Build email content - use simple HTML to avoid escaping issues
                String subject = isDemoMode
                    ? "[DEMO] Fall - " + patient.getFirstName() + " " + patient.getLastName() + " [FOR:" + recipientEmail + "]"
                    : "URGENT Fall - " + patient.getFirstName() + " " + patient.getLastName() + " [FOR:" + recipientEmail + "]";

                String htmlBody = buildSimpleHtml(patient, latitude, longitude, eventType, isDemoMode, recipientEmail);

                // NOTE: Resend free tier requires verified domain to send to external emails
                String actualRecipient = "bitecodes.global@gmail.com"; // Verified email
                
                // Build JSON manually to ensure proper escaping
                StringBuilder json = new StringBuilder();
                json.append("{");
                json.append("\"from\":\"onboarding@resend.dev\",");
                json.append("\"to\":[\"").append(actualRecipient).append("\"],");
                json.append("\"subject\":\"").append(escapeJson(subject)).append("\",");
                json.append("\"html\":\"").append(escapeJson(htmlBody)).append("\"");
                json.append("}");
                
                String jsonPayload = json.toString();
                logger.info("📧 [RESEND] Sending to {} (intended for {})", actualRecipient, recipientEmail);

                // Send request
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                    os.flush();
                }

                int responseCode = conn.getResponseCode();
                long duration = System.currentTimeMillis() - startTime;
                logger.info("📧 [RESEND] Response: {} in {}ms", responseCode, duration);

                if (responseCode == 200 || responseCode == 201) {
                    // Read success response
                    try (java.io.BufferedReader br = new java.io.BufferedReader(
                            new java.io.InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                        StringBuilder response = new StringBuilder();
                        String line;
                        while ((line = br.readLine()) != null) {
                            response.append(line);
                        }
                        logger.info("✅ [RESEND] SUCCESS: {}", response.toString());
                    }
                    return true;
                } else {
                    // Read error response
                    String errorBody = "";
                    if (conn.getErrorStream() != null) {
                        try (java.io.BufferedReader br = new java.io.BufferedReader(
                                new java.io.InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                            StringBuilder response = new StringBuilder();
                            String line;
                            while ((line = br.readLine()) != null) {
                                response.append(line);
                            }
                            errorBody = response.toString();
                        }
                    }
                    logger.error("❌ [RESEND] Error {}: {}", responseCode, errorBody);
                    
                    // Don't retry on 4xx errors (client errors like invalid API key)
                    if (responseCode >= 400 && responseCode < 500) {
                        return false;
                    }
                }
                
                conn.disconnect();
                
            } catch (java.net.SocketTimeoutException e) {
                logger.error("❌ [RESEND] Attempt {} timeout: {}", attempt, e.getMessage());
            } catch (java.net.ConnectException e) {
                logger.error("❌ [RESEND] Attempt {} connection failed: {}", attempt, e.getMessage());
            } catch (Exception e) {
                logger.error("❌ [RESEND] Attempt {} error: {} - {}", attempt, e.getClass().getSimpleName(), e.getMessage());
            }
            
            // Retry with backoff if not last attempt
            if (attempt < maxRetries) {
                try {
                    logger.info("⏳ [RESEND] Retrying in {}ms...", backoffMs);
                    Thread.sleep(backoffMs);
                    backoffMs *= 2;
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
        }
        
        long duration = System.currentTimeMillis() - startTime;
        logger.error("❌ [RESEND] FAILED after {} attempts ({}ms)", maxRetries, duration);
        return false;
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        // Only escape characters that are invalid in JSON strings
        return text
            .replace("\\", "\\\\")   // Backslash first
            .replace("\"", "\\\"")   // Double quotes
            .replace("\n", "\\n")    // Newline
            .replace("\r", "\\r")    // Carriage return
            .replace("\t", "\\t")    // Tab
            .replace("\b", "\\b")    // Backspace
            .replace("\f", "\\f");   // Form feed
        // NOTE: Single quotes do NOT need escaping in JSON
    }
    
    private String buildSimpleHtml(Patient patient, Double latitude, Double longitude, 
                                   String eventType, Boolean isDemoMode, String recipientEmail) {
        // Ultra-simple HTML - avoid single quotes, use double quotes for HTML attributes
        String name = (patient.getFirstName() != null ? patient.getFirstName() : "") + " " + 
                      (patient.getLastName() != null ? patient.getLastName() : "");
        String blood = patient.getBloodGroup() != null ? patient.getBloodGroup() : "Unknown";
        String allergies = patient.getAllergies() != null ? patient.getAllergies() : "None";
        String phone = patient.getPhoneNumber() != null ? patient.getPhoneNumber() : "N/A";
        String mapsUrl = "https://www.google.com/maps?q=" + latitude + "," + longitude;
        
        // Build simple HTML without problematic characters
        StringBuilder html = new StringBuilder();
        html.append("<h2>EMERGENCY: Fall Detected</h2>");
        if (isDemoMode != null && isDemoMode) {
            html.append("<p><b>[DEMO MODE - TEST ALERT]</b></p>");
        }
        html.append("<p><b>Intended For:</b> ").append(recipientEmail).append("</p>");
        html.append("<p><b>Patient:</b> ").append(name.trim()).append("</p>");
        html.append("<p><b>Blood Group:</b> ").append(blood).append("</p>");
        html.append("<p><b>Allergies:</b> ").append(allergies).append("</p>");
        html.append("<p><b>Phone:</b> ").append(phone).append("</p>");
        html.append("<p><b>Coordinates:</b> ").append(latitude).append(", ").append(longitude).append("</p>");
        html.append("<p><a href=\\\"").append(mapsUrl).append("\\\">Open in Google Maps</a></p>");
        html.append("<hr><p>Silent Guardian - Medical AI System</p>");
        
        return html.toString();
    }
}
