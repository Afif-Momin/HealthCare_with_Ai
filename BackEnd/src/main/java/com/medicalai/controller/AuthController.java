package com.medicalai.controller;

import com.medicalai.dto.*;
import com.medicalai.entity.User;
import com.medicalai.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${admin.email:ismailmansury9737@gmail.com}")
    private String adminEmail;

    /**
     * Register a new user (Doctor, Nurse, Patient)
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Verify OTP sent to email
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        AuthResponse response = authService.verifyOtp(request.getEmail(), request.getOtp());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Resend OTP
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<AuthResponse> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        AuthResponse response = authService.resendOtp(email);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(401).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Get user profile by email
     */
    @GetMapping("/profile/{email}")
    public ResponseEntity<?> getProfile(@PathVariable String email) {
        // Admin has no DB record
        if (adminEmail.equalsIgnoreCase(email)) {
            Map<String, Object> adminProfile = new HashMap<>();
            adminProfile.put("fullName", "System Administrator");
            adminProfile.put("email", adminEmail);
            adminProfile.put("role", "ADMIN");
            adminProfile.put("phone", "N/A");
            return ResponseEntity.ok(adminProfile);
        }

        User user = authService.getProfile(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    /**
     * Update user profile
     */
    @PutMapping("/profile/{email}")
    public ResponseEntity<AuthResponse> updateProfile(
            @PathVariable String email,
            @RequestBody RegisterRequest request) {
        AuthResponse response = authService.updateProfile(email, request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
