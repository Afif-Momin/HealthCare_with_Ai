package com.medicalai.service;

import com.medicalai.dto.*;
import com.medicalai.entity.Patient;
import com.medicalai.entity.User;
import com.medicalai.repository.PatientRepository;
import com.medicalai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${admin.email:ismailmansury9737@gmail.com}")
    private String adminEmail;

    @Value("${admin.password:Ismail@786}")
    private String adminPassword;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponse register(RegisterRequest req) {
        if (adminEmail.equalsIgnoreCase(req.getEmail())) {
            return new AuthResponse(false, "This email is reserved for admin access.");
        }
        if (userRepository.existsByEmail(req.getEmail().toLowerCase().trim())) {
            User existing = userRepository.findByEmail(req.getEmail().toLowerCase().trim()).get();
            return new AuthResponse(false,
                "Email already registered as " + existing.getRole().name().toLowerCase() +
                ". Cannot register with a different role.");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(req.getRole().toUpperCase());
            if (role == User.Role.ADMIN) {
                return new AuthResponse(false, "Cannot register as admin.");
            }
        } catch (Exception e) {
            return new AuthResponse(false, "Invalid role. Choose DOCTOR, NURSE, or PATIENT.");
        }

        String otp = generateOtp();

        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        user.setPhone(req.getPhone());
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        user.setVerified(false);

        switch (role) {
            case DOCTOR:
                user.setSpecialization(req.getSpecialization());
                user.setLicenseNumber(req.getLicenseNumber());
                user.setDepartment(req.getDepartment());
                break;
            case NURSE:
                user.setDepartment(req.getDepartment());
                user.setWard(req.getWard());
                user.setShift(req.getShift());
                break;
            case PATIENT:
                user.setDateOfBirth(req.getDateOfBirth());
                user.setBloodGroup(req.getBloodGroup());
                user.setAddress(req.getAddress());
                user.setGender(req.getGender());
                user.setHeight(req.getHeight());
                user.setWeight(req.getWeight());
                user.setAllergies(req.getAllergies());
                user.setMedicalHistorySummary(req.getMedicalHistorySummary());
                user.setEmergencyContactName(req.getEmergencyContactName());
                user.setEmergencyContactPhone(req.getEmergencyContactPhone());
                break;
            default: break;
        }

        userRepository.save(user);

        try { sendOtpEmail(user.getEmail(), user.getFullName(), otp); }
        catch (Exception e) { System.err.println("OTP email failed: " + e.getMessage()); }

        AuthResponse resp = new AuthResponse(true, "Registration successful! Check your email for the OTP.");
        resp.setEmail(user.getEmail());
        return resp;
    }

    public AuthResponse verifyOtp(String email, String otp) {
        Optional<User> optUser = userRepository.findByEmail(email.toLowerCase().trim());
        if (optUser.isEmpty()) return new AuthResponse(false, "User not found.");

        User user = optUser.get();
        if (user.isVerified()) {
            if (user.getRole() == User.Role.PATIENT) {
                ensurePatientRecord(user);
            }
            String token = generateToken(user);
            AuthResponse resp = new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getFullName(), user.getId());
            resp.setMessage("Already verified. Logged in successfully.");
            return resp;
        }
        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp))
            return new AuthResponse(false, "Invalid OTP code.");
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry()))
            return new AuthResponse(false, "OTP expired. Request a new one.");

        user.setVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        if (user.getRole() == User.Role.PATIENT) {
            ensurePatientRecord(user);
        }

        String token = generateToken(user);
        AuthResponse resp = new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getFullName(), user.getId());
        resp.setMessage("Email verified! Welcome to InnovAItion Healthcare.");
        return resp;
    }

    public AuthResponse resendOtp(String email) {
        Optional<User> optUser = userRepository.findByEmail(email.toLowerCase().trim());
        if (optUser.isEmpty()) return new AuthResponse(false, "User not found.");

        User user = optUser.get();
        if (user.isVerified()) return new AuthResponse(false, "Email already verified.");

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        try { sendOtpEmail(user.getEmail(), user.getFullName(), otp); }
        catch (Exception e) { return new AuthResponse(false, "Failed to resend OTP: " + e.getMessage()); }

        return new AuthResponse(true, "OTP resent to " + email);
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().trim();
        String raw = req.getPassword();

        // Static admin check
        if (adminEmail.equalsIgnoreCase(email) && adminPassword.equals(raw)) {
            String token = "ADMIN-" + UUID.randomUUID().toString().replace("-", "");
            AuthResponse resp = new AuthResponse(token, "ADMIN", adminEmail, "System Administrator", 0L);
            resp.setMessage("Welcome back, Admin!");
            return resp;
        }

        Optional<User> optUser = userRepository.findByEmail(email.toLowerCase());
        if (optUser.isEmpty()) return new AuthResponse(false, "Invalid email or password.");

        User user = optUser.get();
        if (!passwordEncoder.matches(raw, user.getPassword()))
            return new AuthResponse(false, "Invalid email or password.");

        if (!user.isVerified()) {
            AuthResponse resp = new AuthResponse(false, "Email not verified. Please check your email for the OTP.");
            resp.setEmail(user.getEmail());
            return resp;
        }

        if (user.getRole() == User.Role.PATIENT) {
            ensurePatientRecord(user);
        }

        String token = generateToken(user);
        AuthResponse resp = new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getFullName(), user.getId());
        resp.setMessage("Welcome back, " + user.getFullName() + "!");
        return resp;
    }

    public User getProfile(String email) {
        return userRepository.findByEmail(email.toLowerCase()).orElse(null);
    }

    public AuthResponse updateProfile(String email, RegisterRequest req) {
        Optional<User> optUser = userRepository.findByEmail(email.toLowerCase());
        if (optUser.isEmpty()) return new AuthResponse(false, "User not found.");

        User user = optUser.get();
        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getSpecialization() != null) user.setSpecialization(req.getSpecialization());
        if (req.getLicenseNumber() != null) user.setLicenseNumber(req.getLicenseNumber());
        if (req.getDepartment() != null) user.setDepartment(req.getDepartment());
        if (req.getWard() != null) user.setWard(req.getWard());
        if (req.getShift() != null) user.setShift(req.getShift());
        if (req.getDateOfBirth() != null) user.setDateOfBirth(req.getDateOfBirth());
        if (req.getBloodGroup() != null) user.setBloodGroup(req.getBloodGroup());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getGender() != null) user.setGender(req.getGender());
        if (req.getHeight() != null) user.setHeight(req.getHeight());
        if (req.getWeight() != null) user.setWeight(req.getWeight());
        if (req.getAllergies() != null) user.setAllergies(req.getAllergies());
        if (req.getMedicalHistorySummary() != null) user.setMedicalHistorySummary(req.getMedicalHistorySummary());
        if (req.getEmergencyContactName() != null) user.setEmergencyContactName(req.getEmergencyContactName());
        if (req.getEmergencyContactPhone() != null) user.setEmergencyContactPhone(req.getEmergencyContactPhone());

        userRepository.save(user);
        return new AuthResponse(true, "Profile updated successfully.");
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void backfillPatientRecords() {
        try {
            List<User> verifiedPatients = userRepository.findByRoleAndIsVerified(User.Role.PATIENT, true);
            System.out.println("🔍 Patient backfill scanning " + verifiedPatients.size() + " verified PATIENT user(s)...");
            int created = 0;
            int skipped = 0;
            for (User u : verifiedPatients) {
                if (patientRepository.findByEmail(u.getEmail()).isPresent()) {
                    skipped++;
                    continue;
                }
                if (ensurePatientRecord(u)) created++;
            }
            System.out.println("✅ Patient backfill done — created " + created + ", already-present " + skipped);
        } catch (Exception e) {
            System.err.println("❌ Patient backfill failed:");
            e.printStackTrace();
        }
    }

    @Transactional
    public boolean ensurePatientRecord(User user) {
        try {
            if (patientRepository.findByEmail(user.getEmail()).isPresent()) return false;

            Patient p = new Patient();
            String fullName = user.getFullName() != null ? user.getFullName().trim() : "";
            int space = fullName.indexOf(' ');
            if (space > 0) {
                p.setFirstName(fullName.substring(0, space));
                p.setLastName(fullName.substring(space + 1));
            } else {
                p.setFirstName(fullName.isEmpty() ? "Unknown" : fullName);
                p.setLastName("-");
            }
            p.setEmail(user.getEmail());

            // phoneNumber has a UNIQUE constraint — set to null if it would collide
            String phone = user.getPhone();
            if (phone != null && !phone.isBlank()) {
                if (patientRepository.findByPhoneNumber(phone).isPresent()) {
                    System.err.println("⚠️  Phone " + phone + " already used; saving patient " + user.getEmail() + " without phone.");
                    phone = null;
                }
            }
            p.setPhoneNumber(phone);

            p.setBloodGroup(user.getBloodGroup());
            p.setAllergies(user.getAllergies());
            p.setMedicalHistory(user.getMedicalHistorySummary());
            p.setAddress(user.getAddress());
            p.setEmergencyContactName(user.getEmergencyContactName());
            p.setEmergencyContactPhone(user.getEmergencyContactPhone());
            p.setHeight(user.getHeight());
            p.setWeight(user.getWeight());

            if (user.getGender() != null) {
                try { p.setGender(Patient.Gender.valueOf(user.getGender().toUpperCase())); }
                catch (Exception ignored) {}
            }

            LocalDate dob = null;
            if (user.getDateOfBirth() != null && !user.getDateOfBirth().isBlank()) {
                try { dob = LocalDate.parse(user.getDateOfBirth()); } catch (Exception ignored) {}
            }
            p.setDateOfBirth(dob != null ? dob : LocalDate.of(1990, 1, 1));

            patientRepository.save(p);
            System.out.println("✅ Created patient record for " + user.getEmail());
            return true;
        } catch (Exception e) {
            System.err.println("❌ ensurePatientRecord failed for " + user.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // ── Token / OTP helpers ──────────────────────────────────────────────────

    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    private String generateToken(User user) {
        return user.getRole().name() + "-" + user.getId() + "-" + UUID.randomUUID().toString().replace("-", "");
    }

    private void sendOtpEmail(String to, String name, String otp) throws Exception {
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
        h.setFrom("bitecodes.global@gmail.com", "InnovAItion Healthcare");
        h.setTo(to);
        h.setSubject("Your OTP: " + otp + " — InnovAItion Healthcare");
        h.setText(buildOtpHtml(name, otp), true);
        mailSender.send(msg);
        System.out.println("✅ OTP sent to: " + to);
    }

    private String buildOtpHtml(String name, String otp) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>" +
            "body{font-family:'Segoe UI',Arial,sans-serif;background:#050508;color:#fff;margin:0;padding:20px}" +
            ".wrap{max-width:560px;margin:0 auto;background:#0a0a12;border:1px solid rgba(0,212,255,0.2);border-radius:16px;overflow:hidden}" +
            ".hdr{background:linear-gradient(135deg,#00d4ff,#7c3aed);padding:32px;text-align:center}" +
            ".hdr h1{margin:0;font-size:1.8rem;color:#fff}" +
            ".body{padding:36px 30px;text-align:center}" +
            ".otp-box{background:rgba(0,212,255,0.08);border:2px solid rgba(0,212,255,0.4);border-radius:16px;padding:28px;margin:24px 0}" +
            ".otp-lbl{font-size:0.8rem;color:#a0a0b0;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px}" +
            ".otp-code{font-size:3rem;font-weight:800;letter-spacing:12px;color:#00d4ff}" +
            ".note{font-size:0.82rem;color:#6b6b80;margin-top:8px}" +
            ".warn{background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.25);border-radius:8px;padding:14px;margin-top:20px;color:#ff6b6b;font-size:0.82rem}" +
            ".ftr{padding:16px 30px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;font-size:0.72rem;color:#6b6b80}" +
            "</style></head><body><div class='wrap'>" +
            "<div class='hdr'><h1>✦ InnovAItion</h1><p style='color:rgba(255,255,255,0.8);margin:6px 0 0'>Healthcare AI Platform</p></div>" +
            "<div class='body'><p>Hello, <strong style='color:#fff'>" + name + "</strong> 👋</p>" +
            "<p style='color:#a0a0b0'>Use the OTP below to verify your email and complete registration.</p>" +
            "<div class='otp-box'><div class='otp-lbl'>Your Verification Code</div>" +
            "<div class='otp-code'>" + otp + "</div><div class='note'>Valid for 10 minutes</div></div>" +
            "<div class='warn'>⚠️ Never share this code with anyone.</div></div>" +
            "<div class='ftr'>© 2026 InnovAItion Healthcare AI</div></div></body></html>";
    }
}
