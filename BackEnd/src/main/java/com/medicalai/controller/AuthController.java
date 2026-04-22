package com.medicalai.controller;

import com.medicalai.dto.*;
import com.medicalai.entity.Patient;
import com.medicalai.entity.User;
import com.medicalai.repository.PatientRepository;
import com.medicalai.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private PatientRepository patientRepository;

    @Value("${admin.email:ismailmansury9737@gmail.com}")
    private String adminEmail;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        AuthResponse response = authService.verifyOtp(request.getEmail(), request.getOtp());
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<AuthResponse> resendOtp(@RequestBody Map<String, String> body) {
        AuthResponse response = authService.resendOtp(body.get("email"));
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.status(401).body(response);
    }

    /**
     * Looks up the Patient.id by email so PATIENT users can filter their own data.
     * The Patient table (patients) is separate from the User auth table (app_users).
     */
    @GetMapping("/patient-id/{email}")
    public ResponseEntity<Map<String, Object>> getPatientId(@PathVariable String email) {
        Optional<Patient> patient = patientRepository.findByEmail(email.toLowerCase().trim());
        Map<String, Object> result = new HashMap<>();
        if (patient.isPresent()) {
            result.put("patientId", patient.get().getId());
            result.put("found", true);
        } else {
            result.put("patientId", null);
            result.put("found", false);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/profile/{email}")
    public ResponseEntity<?> getProfile(@PathVariable String email) {
        if (adminEmail.equalsIgnoreCase(email)) {
            Map<String, Object> admin = new HashMap<>();
            admin.put("fullName", "System Administrator");
            admin.put("email", adminEmail);
            admin.put("role", "ADMIN");
            admin.put("phone", "N/A");
            return ResponseEntity.ok(admin);
        }
        User user = authService.getProfile(email);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PutMapping("/profile/{email}")
    public ResponseEntity<AuthResponse> updateProfile(
            @PathVariable String email,
            @RequestBody RegisterRequest request) {
        AuthResponse response = authService.updateProfile(email, request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }
}
