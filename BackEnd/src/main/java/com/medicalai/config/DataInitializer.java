package com.medicalai.config;

import com.medicalai.entity.User;
import com.medicalai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Database Initializer
 * 
 * Creates default users on application startup if they don't exist.
 * This ensures there are test accounts available for immediate use.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Value("${admin.email:ismailmansury9737@gmail.com}")
    private String adminEmail;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔄 Initializing database...");
        
        // Note: Admin login is handled separately in AuthService (static check)
        // No need to create admin user in database
        
        createDefaultUsers();
        
        System.out.println("✅ Database initialization complete!");
    }

    private void createDefaultUsers() {
        // Create default doctor if not exists
        if (!userRepository.existsByEmail("doctor@healthcare.com")) {
            User doctor = new User();
            doctor.setFullName("Dr. Sarah Johnson");
            doctor.setEmail("doctor@healthcare.com");
            doctor.setPassword(passwordEncoder.encode("doctor123"));
            doctor.setRole(User.Role.DOCTOR);
            doctor.setPhone("+1-555-0101");
            doctor.setSpecialization("Cardiology");
            doctor.setLicenseNumber("MD-12345");
            doctor.setDepartment("Cardiology");
            doctor.setVerified(true); // Pre-verified for testing
            userRepository.save(doctor);
            System.out.println("✅ Created default doctor: doctor@healthcare.com / doctor123");
        }

        // Create default nurse if not exists
        if (!userRepository.existsByEmail("nurse@healthcare.com")) {
            User nurse = new User();
            nurse.setFullName("Emily Davis");
            nurse.setEmail("nurse@healthcare.com");
            nurse.setPassword(passwordEncoder.encode("nurse123"));
            nurse.setRole(User.Role.NURSE);
            nurse.setPhone("+1-555-0102");
            nurse.setDepartment("Emergency");
            nurse.setWard("Ward A");
            nurse.setShift("Day");
            nurse.setVerified(true); // Pre-verified for testing
            userRepository.save(nurse);
            System.out.println("✅ Created default nurse: nurse@healthcare.com / nurse123");
        }

        // Create default patient if not exists
        if (!userRepository.existsByEmail("patient@healthcare.com")) {
            User patient = new User();
            patient.setFullName("John Smith");
            patient.setEmail("patient@healthcare.com");
            patient.setPassword(passwordEncoder.encode("patient123"));
            patient.setRole(User.Role.PATIENT);
            patient.setPhone("+1-555-0103");
            patient.setDateOfBirth(LocalDate.of(1985, 5, 15));
            patient.setBloodGroup("O+");
            patient.setAddress("123 Main St, New York, NY 10001");
            patient.setGender("Male");
            patient.setHeight(175.0);
            patient.setWeight(75.0);
            patient.setAllergies("None");
            patient.setMedicalHistorySummary("No significant medical history");
            patient.setEmergencyContactName("Jane Smith");
            patient.setEmergencyContactPhone("+1-555-0104");
            patient.setVerified(true); // Pre-verified for testing
            userRepository.save(patient);
            System.out.println("✅ Created default patient: patient@healthcare.com / patient123");
        }

        System.out.println("\n📋 Default Login Credentials:");
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("👨‍⚕️  Doctor:  doctor@healthcare.com  / doctor123");
        System.out.println("👩‍⚕️  Nurse:   nurse@healthcare.com   / nurse123");
        System.out.println("🏥  Patient: patient@healthcare.com / patient123");
        System.out.println("🔐  Admin:   " + adminEmail + " / (from env var)");
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }
}
