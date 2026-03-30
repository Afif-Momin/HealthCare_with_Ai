package com.medicalai.controller;

import com.medicalai.dto.SOSRequestDTO;
import com.medicalai.dto.SOSResponseDTO;
import com.medicalai.service.SOSService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * SOS Controller
 * 
 * REST endpoint for emergency SOS requests from the Silent Guardian mobile app.
 * 
 * WHY: This is the critical API endpoint that receives emergency alerts when
 * a fall is detected. It must be fast, reliable, and well-logged.
 * 
 * Endpoint: POST /api/sos
 * 
 * Flow:
 * 1. Mobile app detects fall → countdown expires → triggers emergency
 * 2. Mobile app sends POST to /api/sos with patient ID, GPS, event type
 * 3. Backend processes: logs event, sends email, returns confirmation
 * 4. Mobile app shows "Help is on the way" message
 */
@RestController
@RequestMapping("/api/sos")
@CrossOrigin(origins = "*")
public class SOSController {

    private static final Logger logger = LoggerFactory.getLogger(SOSController.class);

    @Autowired
    private SOSService sosService;
    
    @Autowired
    private com.medicalai.service.EmailService emailService;
    
    @Autowired
    private com.medicalai.service.ResendEmailService resendEmailService;
    
    @Autowired
    private com.medicalai.repository.PatientRepository patientRepository;

    /**
     * Emergency SOS Endpoint
     * 
     * This is called when:
     * - Fall is detected and 10-second countdown expires
     * - User manually triggers emergency (future feature)
     * - Demo mode is activated
     * 
     * WHY POST: Emergency requests modify state (log event, send email)
     * and contain sensitive data (GPS coordinates, patient info)
     * 
     * @param request SOS request with patient ID, GPS, event type
     * @return Response confirming emergency was processed
     */
    @PostMapping
    public ResponseEntity<SOSResponseDTO> triggerEmergency(@Valid @RequestBody SOSRequestDTO request) {
        logger.info("🚨 EMERGENCY SOS REQUEST - Patient: {}, Event: {}, Demo: {}", 
                   request.getPatientId(), request.getEventType(), request.getIsDemoMode());

        try {
            SOSResponseDTO response = sosService.processSOSRequest(request);
            
            // Return 200 OK even if email failed - event is logged
            // WHY: Mobile app needs confirmation, and we can retry email later
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ CRITICAL ERROR processing SOS request: {}", e.getMessage(), e);
            
            // Return error response but don't fail silently
            // WHY: Mobile app needs to know something went wrong
            SOSResponseDTO errorResponse = new SOSResponseDTO();
            errorResponse.setMessage("Emergency request received but processing failed. Please contact emergency services directly.");
            errorResponse.setEmailSent(false);
            errorResponse.setTimestamp(java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Debug endpoint to test email via Resend HTTP API
     * GET /api/sos/test-email?to=email@example.com
     */
    @GetMapping("/test-email")
    public ResponseEntity<String> testEmail(@RequestParam(defaultValue = "ismailmansury9737@gmail.com") String to) {
        logger.info("🧪 Testing Resend email to: {}", to);
        try {
            var patient = patientRepository.findById(1L).orElse(null);
            if (patient == null) {
                return ResponseEntity.ok("ERROR: Patient 1 not found");
            }
            
            // Test Resend HTTP API (works on Render!)
            boolean sent = resendEmailService.sendEmergencyEmail(patient, 23.0225, 72.5714, "RESEND_TEST", true, to);
            
            if (sent) {
                return ResponseEntity.ok("SUCCESS: Resend email sent to " + to);
            } else {
                return ResponseEntity.ok("FAILED: Resend returned false. Check server logs for details.");
            }
            
        } catch (Exception e) {
            String error = e.getClass().getSimpleName() + ": " + e.getMessage();
            logger.error("Resend test failed: {}", error);
            return ResponseEntity.ok("ERROR: " + error);
        }
    }
    
    /**
     * Debug: Check Resend API key status
     */
    @GetMapping("/debug")
    public ResponseEntity<String> debugConfig() {
        try {
            // Test Resend directly
            String testResult = testResendDirect();
            return ResponseEntity.ok("Resend direct test: " + testResult);
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }
    
    private String testResendDirect() throws Exception {
        java.net.URL url = new java.net.URL("https://api.resend.com/emails");
        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer re_H43Z7ya7_8EgKHj2beJBjzARyo2xJY3AB");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(10000);
        
        String json = "{\"from\":\"onboarding@resend.dev\",\"to\":[\"bitecodes.global@gmail.com\"],\"subject\":\"Debug Test\",\"html\":\"<p>Test</p>\"}";
        
        try (java.io.OutputStream os = conn.getOutputStream()) {
            os.write(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
        
        int code = conn.getResponseCode();
        if (code == 200 || code == 201) {
            return "SUCCESS - Email sent!";
        } else {
            java.io.BufferedReader br = new java.io.BufferedReader(
                new java.io.InputStreamReader(conn.getErrorStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            return "FAILED " + code + ": " + sb.toString();
        }
    }
}
