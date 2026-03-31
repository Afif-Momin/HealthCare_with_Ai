package com.medicalai.service;

import com.medicalai.entity.AIAnalysis;
import com.medicalai.entity.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendAnalysisReport(Patient patient, AIAnalysis analysis) {
        try {
            if (patient.getEmail() == null || patient.getEmail().isEmpty()) {
                System.out.println("Patient email not available, skipping email send");
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("bitecodes.global@gmail.com", "Medical AI System");
            helper.setTo(patient.getEmail());
            helper.setSubject("Your AI Medical Analysis Report - " + analysis.getAnalysisType());

            // Build HTML email content
            String htmlContent = buildEmailContent(patient, analysis);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + patient.getEmail());
        } catch (MessagingException e) {
            System.err.println("Error sending email: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Unexpected error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildEmailContent(Patient patient, AIAnalysis analysis) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 800px; margin: 0 auto; padding: 20px; background: #f9fafb; }");
        html.append(".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }");
        html.append(".content { background: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }");
        html.append(".section { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }");
        html.append(".section:last-child { border-bottom: none; }");
        html.append("h2 { color: #667eea; margin-top: 0; }");
        html.append(".badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; }");
        html.append(".badge-high { background: #fee2e2; color: #991b1b; }");
        html.append(".badge-medium { background: #fef3c7; color: #92400e; }");
        html.append(".badge-low { background: #d1fae5; color: #065f46; }");
        html.append(".footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.875rem; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");
        
        // Header
        html.append("<div class='header'>");
        html.append("<h1>🧠 Medical AI Analysis Report</h1>");
        html.append("<p>Generated on ").append(analysis.getCreatedAt()).append("</p>");
        html.append("</div>");
        
        // Content
        html.append("<div class='content'>");
        
        // Patient Info
        html.append("<div class='section'>");
        html.append("<h2>Patient Information</h2>");
        html.append("<p><strong>Name:</strong> ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("</p>");
        if (patient.getDateOfBirth() != null) {
            html.append("<p><strong>Date of Birth:</strong> ").append(patient.getDateOfBirth()).append("</p>");
        }
        html.append("</div>");
        
        // Analysis Type
        html.append("<div class='section'>");
        html.append("<h2>Analysis Type</h2>");
        html.append("<p>").append(analysis.getAnalysisType()).append("</p>");
        html.append("</div>");
        
        // Risk Assessment
        if (analysis.getConfidenceScore() != null) {
            html.append("<div class='section'>");
            html.append("<h2>Risk Assessment</h2>");
            html.append("<p><strong>Confidence Score:</strong> ").append(analysis.getConfidenceScore()).append("</p>");
            html.append("</div>");
        }
        
        // Analysis Result
        html.append("<div class='section'>");
        html.append("<h2>Analysis Result</h2>");
        String result = analysis.getAnalysisResult() != null ? analysis.getAnalysisResult() : "No analysis result available.";
        html.append("<div style='white-space: pre-wrap; background: #f9fafb; padding: 15px; border-radius: 5px;'>").append(result).append("</div>");
        html.append("</div>");
        
        // Recommendations
        if (analysis.getRecommendations() != null && !analysis.getRecommendations().isEmpty()) {
            html.append("<div class='section'>");
            html.append("<h2>Recommendations</h2>");
            html.append("<div style='white-space: pre-wrap; background: #ecfdf5; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981;'>").append(analysis.getRecommendations()).append("</div>");
            html.append("</div>");
        }
        
        html.append("</div>");
        
        // Footer
        html.append("<div class='footer'>");
        html.append("<p><strong>⚠️ Important:</strong> This AI analysis is for informational purposes only and does not replace professional medical consultation.</p>");
        html.append("<p>For emergencies, please consult a healthcare professional immediately.</p>");
        html.append("<p>© 2026 Medical AI System - All rights reserved</p>");
        html.append("</div>");
        
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }

    public void sendPatientProfileToHospital(String hospitalEmail, Patient patient, AIAnalysis lastAnalysis, boolean isEmergency) {
        try {
            if (hospitalEmail == null || hospitalEmail.isEmpty()) {
                System.out.println("Hospital email not available, skipping email send");
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("bitecodes.global@gmail.com", "Medical AI System");
            helper.setTo(hospitalEmail);
            helper.setSubject(isEmergency ? 
                "🚨 EMERGENCY: Patient Profile & Analysis - " + patient.getFirstName() + " " + patient.getLastName() :
                "Patient Profile & Analysis Request - " + patient.getFirstName() + " " + patient.getLastName());

            String htmlContent = buildHospitalEmailContent(patient, lastAnalysis, isEmergency);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Email sent successfully to hospital: " + hospitalEmail);
        } catch (MessagingException e) {
            System.err.println("Error sending email to hospital: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Unexpected error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildHospitalEmailContent(Patient patient, AIAnalysis lastAnalysis, boolean isEmergency) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 900px; margin: 0 auto; padding: 20px; background: #f9fafb; }");
        html.append(isEmergency ? 
            ".header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }" :
            ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }");
        html.append(".content { background: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }");
        html.append(".section { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }");
        html.append(".section:last-child { border-bottom: none; }");
        html.append("h2 { color: #667eea; margin-top: 0; }");
        html.append(".badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; }");
        html.append(".badge-high { background: #fee2e2; color: #991b1b; }");
        html.append(".badge-medium { background: #fef3c7; color: #92400e; }");
        html.append(".badge-low { background: #d1fae5; color: #065f46; }");
        html.append(".info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }");
        html.append(".info-item { padding: 10px; background: #f9fafb; border-radius: 5px; }");
        html.append(".info-label { font-weight: 600; color: #6b7280; font-size: 0.875rem; }");
        html.append(".info-value { color: #111827; margin-top: 5px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");
        
        // Header
        html.append("<div class='header'>");
        html.append("<h1>").append(isEmergency ? "🚨 EMERGENCY REQUEST" : "📋 Patient Profile").append("</h1>");
        html.append("<p>").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("</p>");
        if (isEmergency) {
            html.append("<p style='font-size: 1.2rem; font-weight: bold; margin-top: 10px;'>URGENT MEDICAL ATTENTION REQUIRED</p>");
        }
        html.append("</div>");
        
        // Content
        html.append("<div class='content'>");
        
        // Patient Information
        html.append("<div class='section'>");
        html.append("<h2>Patient Information</h2>");
        html.append("<div class='info-grid'>");
        html.append("<div class='info-item'><div class='info-label'>Full Name</div><div class='info-value'>")
            .append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("</div></div>");
        if (patient.getDateOfBirth() != null) {
            html.append("<div class='info-item'><div class='info-label'>Date of Birth</div><div class='info-value'>")
                .append(patient.getDateOfBirth()).append("</div></div>");
        }
        if (patient.getGender() != null) {
            html.append("<div class='info-item'><div class='info-label'>Gender</div><div class='info-value'>")
                .append(patient.getGender()).append("</div></div>");
        }
        if (patient.getEmail() != null) {
            html.append("<div class='info-item'><div class='info-label'>Email</div><div class='info-value'>")
                .append(patient.getEmail()).append("</div></div>");
        }
        if (patient.getPhoneNumber() != null) {
            html.append("<div class='info-item'><div class='info-label'>Phone</div><div class='info-value'>")
                .append(patient.getPhoneNumber()).append("</div></div>");
        }
        if (patient.getAddress() != null) {
            html.append("<div class='info-item' style='grid-column: 1 / -1;'><div class='info-label'>Address</div><div class='info-value'>")
                .append(patient.getAddress()).append(", ")
                .append(patient.getCity() != null ? patient.getCity() : "").append(", ")
                .append(patient.getState() != null ? patient.getState() : "").append(" ")
                .append(patient.getZipCode() != null ? patient.getZipCode() : "").append("</div></div>");
        }
        if (patient.getBloodGroup() != null) {
            html.append("<div class='info-item'><div class='info-label'>Blood Group</div><div class='info-value'>")
                .append(patient.getBloodGroup()).append("</div></div>");
        }
        html.append("</div>");
        html.append("</div>");
        
        // Health Profile
        if (patient.getHeight() != null || patient.getWeight() != null || patient.getSystolicBP() != null) {
            html.append("<div class='section'>");
            html.append("<h2>Health Profile</h2>");
            html.append("<div class='info-grid'>");
            if (patient.getHeight() != null) {
                html.append("<div class='info-item'><div class='info-label'>Height</div><div class='info-value'>")
                    .append(patient.getHeight()).append(" cm</div></div>");
            }
            if (patient.getWeight() != null) {
                html.append("<div class='info-item'><div class='info-label'>Weight</div><div class='info-value'>")
                    .append(patient.getWeight()).append(" kg</div></div>");
            }
            if (patient.getSystolicBP() != null && patient.getDiastolicBP() != null) {
                html.append("<div class='info-item'><div class='info-label'>Blood Pressure</div><div class='info-value'>")
                    .append(patient.getSystolicBP()).append("/").append(patient.getDiastolicBP()).append(" mmHg</div></div>");
            }
            if (patient.getTotalCholesterol() != null) {
                html.append("<div class='info-item'><div class='info-label'>Total Cholesterol</div><div class='info-value'>")
                    .append(patient.getTotalCholesterol()).append(" mg/dL</div></div>");
            }
            html.append("</div>");
            html.append("</div>");
        }
        
        // Medical History
        if (patient.getMedicalHistory() != null || patient.getAllergies() != null) {
            html.append("<div class='section'>");
            html.append("<h2>Medical History</h2>");
            if (patient.getAllergies() != null && !patient.getAllergies().isEmpty()) {
                html.append("<p><strong>Allergies:</strong> ").append(patient.getAllergies()).append("</p>");
            }
            if (patient.getMedicalHistory() != null && !patient.getMedicalHistory().isEmpty()) {
                html.append("<p><strong>Medical History:</strong> ").append(patient.getMedicalHistory()).append("</p>");
            }
            html.append("</div>");
        }
        
        // Last AI Analysis
        if (lastAnalysis != null) {
            html.append("<div class='section'>");
            html.append("<h2>Latest AI Analysis</h2>");
            html.append("<p><strong>Analysis Type:</strong> ").append(lastAnalysis.getAnalysisType()).append("</p>");
            html.append("<p><strong>Date:</strong> ").append(lastAnalysis.getCreatedAt()).append("</p>");
            
            if (lastAnalysis.getConfidenceScore() != null) {
                String severity = determineSeverity(lastAnalysis.getConfidenceScore());
                String badgeClass = severity.equals("HIGH") ? "badge-high" : 
                                   severity.equals("MODERATE") ? "badge-medium" : "badge-low";
                html.append("<p><strong>Severity:</strong> <span class='badge ").append(badgeClass).append("'>")
                    .append(severity).append(" RISK</span></p>");
                html.append("<p><strong>Confidence Score:</strong> ").append(lastAnalysis.getConfidenceScore()).append("</p>");
            }
            
            if (lastAnalysis.getAnalysisResult() != null) {
                html.append("<div style='margin-top: 15px;'><strong>Analysis Result:</strong></div>");
                html.append("<div style='white-space: pre-wrap; background: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 10px;'>")
                    .append(lastAnalysis.getAnalysisResult()).append("</div>");
            }
            
            if (lastAnalysis.getRecommendations() != null && !lastAnalysis.getRecommendations().isEmpty()) {
                html.append("<div style='margin-top: 15px;'><strong>Recommendations:</strong></div>");
                html.append("<div style='white-space: pre-wrap; background: #ecfdf5; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #10b981;'>")
                    .append(lastAnalysis.getRecommendations()).append("</div>");
            }
            
            html.append("</div>");
        }
        
        html.append("</div>");
        
        // Footer
        html.append("<div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.875rem;'>");
        html.append("<p>This patient profile has been sent from the Medical AI System</p>");
        html.append("<p>© 2026 Medical AI System - All rights reserved</p>");
        html.append("</div>");
        
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    
    private String determineSeverity(String confidenceScore) {
        if (confidenceScore == null) return "UNKNOWN";
        try {
            String scoreStr = confidenceScore.replace("%", "").trim();
            int score = Integer.parseInt(scoreStr);
            if (score >= 70) return "HIGH";
            if (score >= 40) return "MODERATE";
            return "LOW";
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }

    /**
     * Send Emergency Alert Email
     * 
     * This is the CRITICAL email sent when a fall is detected and emergency is triggered.
     * It must be URGENT, CLEAR, and contain all information first responders need.
     * 
     * WHY: In a real emergency, this email might be the only way hospital staff
     * know a patient needs immediate help. It must be actionable and complete.
     * 
     * @param patient The patient who triggered the emergency
     * @param latitude GPS latitude
     * @param longitude GPS longitude
     * @param eventType Type of emergency (e.g., "FALL_DETECTED")
     * @param isDemoMode Whether this is a test/demo
     */
    public void sendEmergencyAlert(Patient patient, Double latitude, Double longitude, 
                                  String eventType, Boolean isDemoMode) {
        // Default email - calls the new method with default email
        sendEmergencyAlertToEmail(patient, latitude, longitude, eventType, isDemoMode, "ismailmansury@gmail.com");
    }

    /**
     * Send Emergency Alert Email to a SPECIFIC email address
     * 
     * ROBUST IMPLEMENTATION with retry logic and detailed logging.
     * Returns boolean to indicate success/failure.
     * 
     * @param patient The patient who triggered the emergency
     * @param latitude GPS latitude
     * @param longitude GPS longitude
     * @param eventType Type of emergency (e.g., "FALL_DETECTED")
     * @param isDemoMode Whether this is a test/demo
     * @param recipientEmail The email address to send to
     * @return true if email sent successfully, false otherwise
     */
    public boolean sendEmergencyAlertToEmail(Patient patient, Double latitude, Double longitude, 
                                  String eventType, Boolean isDemoMode, String recipientEmail) {
        long startTime = System.currentTimeMillis();
        System.out.println("📧 [EMAIL] Starting send to: " + recipientEmail);
        
        int maxRetries = 3;
        int backoffMs = 500;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                System.out.println("📤 [EMAIL] Attempt " + attempt + "/" + maxRetries + " to " + recipientEmail);
                
                // Use SimpleMailMessage - more reliable than MimeMessage
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("bitecodes.global@gmail.com");
                message.setTo(recipientEmail);
                
                // Subject
                String subject = isDemoMode 
                    ? "[DEMO] Fall Detected - " + patient.getFirstName() + " " + patient.getLastName()
                    : "URGENT: Fall Detected - " + patient.getFirstName() + " " + patient.getLastName();
                message.setSubject(subject);
                
                // Plain text body - most reliable format
                String mapsUrl = "https://www.google.com/maps?q=" + latitude + "," + longitude;
                StringBuilder body = new StringBuilder();
                if (isDemoMode) {
                    body.append("*** DEMO MODE - TEST ALERT ***\n\n");
                }
                body.append("EMERGENCY: FALL DETECTED\n\n");
                body.append("Patient: ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("\n");
                body.append("Blood Group: ").append(patient.getBloodGroup() != null ? patient.getBloodGroup() : "Unknown").append("\n");
                body.append("Allergies: ").append(patient.getAllergies() != null ? patient.getAllergies() : "None").append("\n");
                body.append("Phone: ").append(patient.getPhoneNumber() != null ? patient.getPhoneNumber() : "N/A").append("\n");
                body.append("Emergency Contact: ").append(patient.getEmergencyContactName() != null ? patient.getEmergencyContactName() : "N/A");
                body.append(" - ").append(patient.getEmergencyContactPhone() != null ? patient.getEmergencyContactPhone() : "N/A").append("\n\n");
                body.append("LOCATION: ").append(mapsUrl).append("\n");
                body.append("Coordinates: ").append(latitude).append(", ").append(longitude).append("\n\n");
                body.append("Time: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n\n");
                body.append("---\nSilent Guardian - Medical AI System");
                
                message.setText(body.toString());
                
                mailSender.send(message);
                
                long duration = System.currentTimeMillis() - startTime;
                System.out.println("✅ [EMAIL] SUCCESS - Sent to " + recipientEmail + " in " + duration + "ms (attempt " + attempt + ")");
                return true;
                
            } catch (Exception e) {
                System.err.println("❌ [EMAIL] Attempt " + attempt + " failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                
                if (attempt < maxRetries) {
                    try {
                        System.out.println("⏳ [EMAIL] Retrying in " + backoffMs + "ms...");
                        Thread.sleep(backoffMs);
                        backoffMs *= 2; // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        System.err.println("❌ [EMAIL] Retry interrupted");
                        return false;
                    }
                }
            }
        }
        
        long duration = System.currentTimeMillis() - startTime;
        System.err.println("❌ [EMAIL] FAILED - Could not send to " + recipientEmail + " after " + maxRetries + " attempts (" + duration + "ms)");
        return false;
    }
    
    /**
     * Simple emergency email - minimal HTML for maximum deliverability
     */
    private String buildSimpleEmergencyEmail(Patient patient, Double latitude, Double longitude, 
                                            String eventType, Boolean isDemoMode) {
        String mapsUrl = "https://www.google.com/maps?q=" + latitude + "," + longitude;
        
        StringBuilder html = new StringBuilder();
        html.append("<html><body style='font-family:Arial,sans-serif;'>");
        
        if (isDemoMode) {
            html.append("<p style='color:orange;font-weight:bold;'>[DEMO MODE - TEST ALERT]</p>");
        }
        
        html.append("<h2 style='color:red;'>EMERGENCY: Fall Detected</h2>");
        html.append("<p><strong>Patient:</strong> ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("</p>");
        html.append("<p><strong>Blood Group:</strong> ").append(patient.getBloodGroup() != null ? patient.getBloodGroup() : "Unknown").append("</p>");
        html.append("<p><strong>Allergies:</strong> ").append(patient.getAllergies() != null ? patient.getAllergies() : "None").append("</p>");
        html.append("<p><strong>Phone:</strong> ").append(patient.getPhoneNumber() != null ? patient.getPhoneNumber() : "N/A").append("</p>");
        html.append("<p><strong>Emergency Contact:</strong> ").append(patient.getEmergencyContactName() != null ? patient.getEmergencyContactName() : "N/A");
        html.append(" - ").append(patient.getEmergencyContactPhone() != null ? patient.getEmergencyContactPhone() : "N/A").append("</p>");
        html.append("<p><strong>Location:</strong> <a href='").append(mapsUrl).append("'>Open in Google Maps</a></p>");
        html.append("<p><strong>Coordinates:</strong> ").append(latitude).append(", ").append(longitude).append("</p>");
        html.append("<p><strong>Time:</strong> ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("</p>");
        html.append("<hr><p style='color:gray;font-size:12px;'>Silent Guardian - Medical AI System</p>");
        html.append("</body></html>");
        
        return html.toString();
    }

    /**
     * Build Emergency Email HTML Content
     * 
     * This email must be:
     * - Visually urgent (red colors, clear headers)
     * - Information-dense (all critical patient data)
     * - Actionable (Google Maps link, phone numbers)
     * - Professional (hospitals need to trust this system)
     */
    private String buildEmergencyEmailContent(Patient patient, Double latitude, Double longitude, 
                                            String eventType, Boolean isDemoMode) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }");
        html.append(".container { max-width: 800px; margin: 0 auto; padding: 20px; background: #ffffff; }");
        html.append(".header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }");
        html.append(".header h1 { margin: 0; font-size: 2rem; font-weight: bold; }");
        html.append(".header .subtitle { margin-top: 10px; font-size: 1.2rem; font-weight: 600; }");
        html.append(".content { background: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 5px solid #ef4444; }");
        html.append(".section { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }");
        html.append(".section:last-child { border-bottom: none; }");
        html.append("h2 { color: #dc2626; margin-top: 0; font-size: 1.5rem; border-bottom: 2px solid #fee2e2; padding-bottom: 10px; }");
        html.append(".info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }");
        html.append(".info-item { padding: 15px; background: #fef2f2; border-radius: 5px; border-left: 3px solid #ef4444; }");
        html.append(".info-label { font-weight: 700; color: #991b1b; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px; }");
        html.append(".info-value { color: #111827; margin-top: 8px; font-size: 1.1rem; font-weight: 600; }");
        html.append(".map-link { display: inline-block; margin-top: 15px; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }");
        html.append(".map-link:hover { background: #dc2626; }");
        html.append(".critical { background: #fee2e2; padding: 15px; border-radius: 5px; border: 2px solid #ef4444; margin: 15px 0; }");
        html.append(".critical strong { color: #991b1b; }");
        html.append(".footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 0.875rem; }");
        html.append(".timestamp { background: #f3f4f6; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");
        
        // Header - MUST be visually urgent
        html.append("<div class='header'>");
        html.append("<h1>🚨 EMERGENCY ALERT</h1>");
        html.append("<div class='subtitle'>");
        html.append(isDemoMode ? "⚠️ [DEMO MODE - TEST ALERT]" : "FALL DETECTED - POSSIBLE UNCONSCIOUSNESS");
        html.append("</div>");
        html.append("</div>");
        
        // Content
        html.append("<div class='content'>");
        
        // Critical Alert Section
        html.append("<div class='critical'>");
        html.append("<strong>⚠️ IMMEDIATE MEDICAL ATTENTION REQUIRED</strong><br>");
        html.append("The Silent Guardian system has detected a fall and the patient did not cancel the emergency alert within the 10-second window.");
        html.append("</div>");
        
        // Patient Information - CRITICAL for first responders
        html.append("<div class='section'>");
        html.append("<h2>👤 Patient Information</h2>");
        html.append("<div class='info-grid'>");
        
        // Name
        html.append("<div class='info-item'><div class='info-label'>Full Name</div><div class='info-value'>")
            .append(patient.getFirstName()).append(" ").append(patient.getLastName()).append("</div></div>");
        
        // Age (calculated from date of birth)
        if (patient.getDateOfBirth() != null) {
            int age = java.time.LocalDate.now().getYear() - patient.getDateOfBirth().getYear();
            html.append("<div class='info-item'><div class='info-label'>Age</div><div class='info-value'>")
                .append(age).append(" years</div></div>");
        }
        
        // Blood Group - CRITICAL for emergency responders
        if (patient.getBloodGroup() != null) {
            html.append("<div class='info-item'><div class='info-label'>Blood Group</div><div class='info-value'>")
                .append(patient.getBloodGroup()).append("</div></div>");
        }
        
        // Allergies - CRITICAL to prevent medication errors
        if (patient.getAllergies() != null && !patient.getAllergies().isEmpty()) {
            html.append("<div class='info-item' style='grid-column: 1 / -1;'><div class='info-label'>⚠️ Allergies</div><div class='info-value'>")
                .append(patient.getAllergies()).append("</div></div>");
        }
        
        // Emergency Contact
        if (patient.getEmergencyContactName() != null) {
            html.append("<div class='info-item'><div class='info-label'>Emergency Contact</div><div class='info-value'>")
                .append(patient.getEmergencyContactName()).append("</div></div>");
        }
        
        if (patient.getEmergencyContactPhone() != null) {
            html.append("<div class='info-item'><div class='info-label'>Emergency Contact Phone</div><div class='info-value'>")
                .append("<a href='tel:").append(patient.getEmergencyContactPhone()).append("'>")
                .append(patient.getEmergencyContactPhone()).append("</a></div></div>");
        }
        
        // Patient Phone
        if (patient.getPhoneNumber() != null) {
            html.append("<div class='info-item'><div class='info-label'>Patient Phone</div><div class='info-value'>")
                .append("<a href='tel:").append(patient.getPhoneNumber()).append("'>")
                .append(patient.getPhoneNumber()).append("</a></div></div>");
        }
        
        html.append("</div>");
        html.append("</div>");
        
        // Location - CRITICAL for first responders
        html.append("<div class='section'>");
        html.append("<h2>📍 Emergency Location</h2>");
        html.append("<div class='info-item' style='grid-column: 1 / -1;'>");
        html.append("<div class='info-label'>GPS Coordinates</div>");
        html.append("<div class='info-value'>").append(latitude).append(", ").append(longitude).append("</div>");
        html.append("</div>");
        
        // Google Maps link - WHY: One-click navigation for ambulance
        String mapsUrl = "https://www.google.com/maps?q=" + latitude + "," + longitude;
        html.append("<a href='").append(mapsUrl).append("' target='_blank' class='map-link'>");
        html.append("🗺️ Open in Google Maps");
        html.append("</a>");
        html.append("</div>");
        
        // Event Details
        html.append("<div class='section'>");
        html.append("<h2>📋 Event Details</h2>");
        html.append("<div class='info-item' style='grid-column: 1 / -1;'>");
        html.append("<div class='info-label'>Event Type</div>");
        html.append("<div class='info-value'>").append(eventType).append("</div>");
        html.append("</div>");
        html.append("<div class='info-item' style='grid-column: 1 / -1;'>");
        html.append("<div class='info-label'>Detection Method</div>");
        html.append("<div class='info-value'>").append(isDemoMode ? "Demo/Test Mode" : "Automatic Sensor Detection").append("</div>");
        html.append("</div>");
        html.append("</div>");
        
        // Medical History (if available)
        if (patient.getMedicalHistory() != null && !patient.getMedicalHistory().isEmpty()) {
            html.append("<div class='section'>");
            html.append("<h2>🏥 Medical History</h2>");
            html.append("<div style='background: #f9fafb; padding: 15px; border-radius: 5px;'>");
            html.append(patient.getMedicalHistory());
            html.append("</div>");
            html.append("</div>");
        }
        
        // Full Patient Profile Section
        html.append("<div class='section'>");
        html.append("<h2>📋 Complete Patient Profile</h2>");
        html.append("<div class='info-grid'>");
        
        // Health Profile Details
        if (patient.getHeight() != null) {
            html.append("<div class='info-item'><div class='info-label'>Height</div><div class='info-value'>")
                .append(patient.getHeight()).append(" cm</div></div>");
        }
        if (patient.getWeight() != null) {
            html.append("<div class='info-item'><div class='info-label'>Weight</div><div class='info-value'>")
                .append(patient.getWeight()).append(" kg</div></div>");
        }
        if (patient.getSystolicBP() != null && patient.getDiastolicBP() != null) {
            html.append("<div class='info-item'><div class='info-label'>Blood Pressure</div><div class='info-value'>")
                .append(patient.getSystolicBP()).append("/").append(patient.getDiastolicBP()).append(" mmHg</div></div>");
        }
        if (patient.getRestingHeartRate() != null) {
            html.append("<div class='info-item'><div class='info-label'>Heart Rate</div><div class='info-value'>")
                .append(patient.getRestingHeartRate()).append(" bpm</div></div>");
        }
        if (patient.getTotalCholesterol() != null) {
            html.append("<div class='info-item'><div class='info-label'>Cholesterol</div><div class='info-value'>")
                .append(patient.getTotalCholesterol()).append(" mg/dL</div></div>");
        }
        if (patient.getFastingGlucose() != null) {
            html.append("<div class='info-item'><div class='info-label'>Blood Glucose</div><div class='info-value'>")
                .append(patient.getFastingGlucose()).append(" mg/dL</div></div>");
        }
        
        // Lifestyle Factors
        if (patient.getSmoker() != null && patient.getSmoker()) {
            html.append("<div class='info-item'><div class='info-label'>Smoking Status</div><div class='info-value'>")
                .append("Current Smoker").append("</div></div>");
        }
        if (patient.getExerciseHoursPerWeek() != null) {
            html.append("<div class='info-item'><div class='info-label'>Exercise</div><div class='info-value'>")
                .append(patient.getExerciseHoursPerWeek()).append(" hrs/week</div></div>");
        }
        if (patient.getSleepHoursPerNight() != null) {
            html.append("<div class='info-item'><div class='info-label'>Sleep</div><div class='info-value'>")
                .append(patient.getSleepHoursPerNight()).append(" hrs/night</div></div>");
        }
        
        // Medical Conditions
        if (patient.getDiabetic() != null && patient.getDiabetic()) {
            html.append("<div class='info-item'><div class='info-label'>Diabetes</div><div class='info-value'>")
                .append(patient.getDiabetesType() != null ? patient.getDiabetesType() : "Yes").append("</div></div>");
        }
        if (patient.getOnBPMeds() != null && patient.getOnBPMeds()) {
            html.append("<div class='info-item'><div class='info-label'>BP Medication</div><div class='info-value'>Yes</div></div>");
        }
        if (patient.getOtherMedications() != null && !patient.getOtherMedications().isEmpty()) {
            html.append("<div class='info-item' style='grid-column: 1 / -1;'><div class='info-label'>Other Medications</div><div class='info-value'>")
                .append(patient.getOtherMedications()).append("</div></div>");
        }
        
        html.append("</div>");
        html.append("</div>");
        
        html.append("</div>");
        
        // Timestamp
        html.append("<div class='timestamp'>");
        html.append("<strong>Alert Generated:</strong> ");
        html.append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        html.append("</div>");
        
        // Footer
        html.append("<div class='footer'>");
        html.append("<p><strong>⚠️ This is an automated emergency alert from the Silent Guardian system.</strong></p>");
        html.append("<p>If this is a real emergency, please dispatch medical assistance immediately.</p>");
        html.append("<p>For non-emergencies or false alarms, please contact the patient or emergency contact listed above.</p>");
        html.append("<p>© 2026 Medical AI System - Silent Guardian Emergency Response</p>");
        html.append("</div>");
        
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}

