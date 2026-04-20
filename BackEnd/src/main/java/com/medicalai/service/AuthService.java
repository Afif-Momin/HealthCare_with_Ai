package com.medicalai.service;

import com.medicalai.dto.*;
import com.medicalai.entity.User;
import com.medicalai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${admin.email:ismailmansury9737@gmail.com}")
    private String adminEmail;

    @Value("${admin.password:Ismail@786}")
    private String adminPassword;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Register a new user (Doctor, Nurse, Patient).
     * Admin cannot register through this endpoint.
     * If email already exists (any role), reject.
     */
    public AuthResponse register(RegisterRequest request) {
        // Block admin email from signing up
        if (adminEmail.equalsIgnoreCase(request.getEmail())) {
            return new AuthResponse(false, "This email is reserved for admin access.");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            User existing = userRepository.findByEmail(request.getEmail()).get();
            return new AuthResponse(false,
                "This email is already registered as " + existing.getRole().name().toLowerCase() +
                ". You cannot register with a different role.");
        }

        // Validate role
        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
            if (role == User.Role.ADMIN) {
                return new AuthResponse(false, "Cannot register as admin.");
            }
        } catch (Exception e) {
            return new AuthResponse(false, "Invalid role. Choose DOCTOR, NURSE, or PATIENT.");
        }

        // Generate OTP
        String otp = generateOtp();

        // Create user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setPhone(request.getPhone());
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        user.setVerified(false);

        // Role-specific fields
        switch (role) {
            case DOCTOR:
                user.setSpecialization(request.getSpecialization());
                user.setLicenseNumber(request.getLicenseNumber());
                user.setDepartment(request.getDepartment());
                break;
            case NURSE:
                user.setDepartment(request.getDepartment());
                user.setWard(request.getWard());
                user.setShift(request.getShift());
                break;
            case PATIENT:
                user.setDateOfBirth(request.getDateOfBirth());
                user.setBloodGroup(request.getBloodGroup());
                user.setAddress(request.getAddress());
                user.setGender(request.getGender());
                user.setHeight(request.getHeight());
                user.setWeight(request.getWeight());
                user.setAllergies(request.getAllergies());
                user.setMedicalHistorySummary(request.getMedicalHistorySummary());
                user.setEmergencyContactName(request.getEmergencyContactName());
                user.setEmergencyContactPhone(request.getEmergencyContactPhone());
                break;
            default:
                break;
        }

        userRepository.save(user);

        // Send OTP email asynchronously (don't block response)
        try {
            sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        } catch (Exception e) {
            System.err.println("OTP Email send failed: " + e.getMessage());
        }

        AuthResponse response = new AuthResponse(true, "Registration successful! Please check your email for the OTP.");
        response.setEmail(user.getEmail());
        return response;
    }

    /**
     * Verify OTP code for a user.
     */
    public AuthResponse verifyOtp(String email, String otp) {
        Optional<User> optUser = userRepository.findByEmail(email.toLowerCase().trim());
        if (optUser.isEmpty()) {
            return new AuthResponse(false, "User not found.");
        }

        User user = optUser.get();

        if (user.isVerified()) {
            // Already verified — generate token and allow login
            String token = generateToken(user);
            AuthResponse resp = new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getFullName(), user.getId());
            resp.setMessage("Already verified. Logged in successfully.");
            return resp;
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
            return new AuthResponse(false, "Invalid OTP code.");
        }

        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return new AuthResponse(false, "OTP has expired. Please request a new one.");
        }

        // Mark verified
        user.setVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        String token = generateToken(user);
        AuthResponse resp = new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getFullName(), user.getId());
        resp.setMessage("Email verified successfully! Welcome to InnovAItion Healthcare.");
        return resp;
    }

    /**
     * Resend OTP to user email.
     */
    public AuthResponse resendOtp(String email) {
        Optional<User> optUser = userRepository.findByEmail(email.toLowerCase().trim());
        if (optUser.isEmpty()) {
            return new AuthResponse(false, "User not found.");
        }

        User user = optUser.get();
        if (user.isVerified()) {
            return new AuthResponse(false, "Email already verified.");
        }

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        try {
            sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        } catch (Exception e) {
            return new AuthResponse(false, "Failed to send OTP email: " + e.getMessage());
        }

        return new AuthResponse(true, "OTP resent to " + email);
    }

    /**
     * Login — supports admin static credentials as well as regular users.
     */
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim();
        String raw = request.getPassword();

        // Admin check
        if (adminEmail.equalsIgnoreCase(email) && adminPassword.equals(raw)) {
            String token = "admin-token-" + UUID.randomUUID();
            AuthResponse resp = new AuthResponse(token, "ADMIN", adminEmail, "System Administrator", 0L);
            resp.setMessage("Welcome back, Admin!");
            return resp;
        }

        Optional<User> optUser = userRepository.findByEmail(email.toLowerCase());
        if (optUser.isEmpty()) {
            return new AuthResponse(false, "Invalid email or password.");
        }

        User user = optUser.get();

        if (!passwordEncoder.matches(raw, user.getPassword())) {
            return new AuthResponse(false, "Invalid email or password.");
        }

        if (!user.isVerified()) {
            AuthResponse resp = new AuthResponse(false, "Email not verified. Please check your email for the OTP.");
            resp.setEmail(user.getEmail());
            return resp;
        }

        String token = generateToken(user);
        AuthResponse resp = new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getFullName(), user.getId());
        resp.setMessage("Welcome back, " + user.getFullName() + "!");
        return resp;
    }

    /**
     * Get user profile by email.
     */
    public User getProfile(String email) {
        // Admin has no DB record, handle in controller
        return userRepository.findByEmail(email.toLowerCase()).orElse(null);
    }

    /**
     * Update user profile.
     */
    public AuthResponse updateProfile(String email, RegisterRequest request) {
        Optional<User> optUser = userRepository.findByEmail(email.toLowerCase());
        if (optUser.isEmpty()) {
            return new AuthResponse(false, "User not found.");
        }

        User user = optUser.get();

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getSpecialization() != null) user.setSpecialization(request.getSpecialization());
        if (request.getLicenseNumber() != null) user.setLicenseNumber(request.getLicenseNumber());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getWard() != null) user.setWard(request.getWard());
        if (request.getShift() != null) user.setShift(request.getShift());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getBloodGroup() != null) user.setBloodGroup(request.getBloodGroup());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getHeight() != null) user.setHeight(request.getHeight());
        if (request.getWeight() != null) user.setWeight(request.getWeight());
        if (request.getAllergies() != null) user.setAllergies(request.getAllergies());
        if (request.getMedicalHistorySummary() != null) user.setMedicalHistorySummary(request.getMedicalHistorySummary());
        if (request.getEmergencyContactName() != null) user.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) user.setEmergencyContactPhone(request.getEmergencyContactPhone());

        userRepository.save(user);
        return new AuthResponse(true, "Profile updated successfully.");
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private String generateToken(User user) {
        // Simple token: base64-like identifier (no JWT lib needed; stateless via localStorage)
        return user.getRole().name() + "-" + user.getId() + "-" + UUID.randomUUID().toString().replace("-", "");
    }

    private void sendOtpEmail(String toEmail, String name, String otp) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("bitecodes.global@gmail.com", "InnovAItion Healthcare");
        helper.setTo(toEmail);
        helper.setSubject("Your OTP for InnovAItion Healthcare — " + otp);

        String html = buildOtpEmail(name, otp);
        helper.setText(html, true);

        mailSender.send(message);
        System.out.println("✅ OTP email sent to: " + toEmail);
    }

    private String buildOtpEmail(String name, String otp) {
        return "<!DOCTYPE html>" +
            "<html><head><meta charset='UTF-8'>" +
            "<style>" +
            "body{font-family:'Segoe UI',Arial,sans-serif;background:#050508;color:#fff;margin:0;padding:0}" +
            ".wrap{max-width:600px;margin:40px auto;background:#0a0a12;border:1px solid rgba(0,212,255,0.2);border-radius:16px;overflow:hidden}" +
            ".header{background:linear-gradient(135deg,#00d4ff,#7c3aed);padding:40px 30px;text-align:center}" +
            ".header h1{margin:0;font-size:2rem;color:white;letter-spacing:-1px}" +
            ".header p{color:rgba(255,255,255,0.85);margin:8px 0 0}" +
            ".body{padding:40px 30px;text-align:center}" +
            ".greeting{font-size:1.1rem;color:#a0a0b0;margin-bottom:24px}" +
            ".otp-box{background:rgba(0,212,255,0.08);border:2px solid rgba(0,212,255,0.4);border-radius:16px;padding:32px;margin:24px 0}" +
            ".otp-label{font-size:0.85rem;color:#a0a0b0;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}" +
            ".otp-code{font-size:3.5rem;font-weight:800;letter-spacing:12px;color:#00d4ff;text-shadow:0 0 30px rgba(0,212,255,0.5)}" +
            ".note{font-size:0.85rem;color:#6b6b80;margin-top:8px}" +
            ".warning{background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);border-radius:8px;padding:16px;margin-top:24px;color:#ff6b6b;font-size:0.875rem}" +
            ".footer{padding:20px 30px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;font-size:0.75rem;color:#6b6b80}" +
            "</style></head><body>" +
            "<div class='wrap'>" +
            "<div class='header'><h1>✦ InnovAItion</h1><p>Healthcare AI Platform</p></div>" +
            "<div class='body'>" +
            "<p class='greeting'>Hello, <strong style='color:#fff'>" + name + "</strong>! 👋</p>" +
            "<p style='color:#a0a0b0'>Use the OTP below to verify your email and complete registration.</p>" +
            "<div class='otp-box'>" +
            "<div class='otp-label'>Your Verification Code</div>" +
            "<div class='otp-code'>" + otp + "</div>" +
            "<div class='note'>Valid for 10 minutes</div>" +
            "</div>" +
            "<div class='warning'>⚠️ Never share this code with anyone. InnovAItion will never ask for your OTP.</div>" +
            "</div>" +
            "<div class='footer'>© 2026 InnovAItion Healthcare AI • All rights reserved</div>" +
            "</div></body></html>";
    }
}
