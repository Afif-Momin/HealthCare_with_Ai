package com.medicalai.service;

import com.medicalai.entity.Patient;
import com.medicalai.entity.AIAnalysis;
import com.medicalai.repository.PatientRepository;
import com.medicalai.repository.AIAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class HospitalConnectorService {

    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;
    
    @Autowired
    private EmailService emailService;

    private static Map<String, Object> createHospital(String name, double lat, double lon, String specialty, String services) {
        Map<String, Object> hospital = new HashMap<>();
        hospital.put("id", UUID.randomUUID().toString());
        hospital.put("name", name);
        hospital.put("latitude", lat);
        hospital.put("longitude", lon);
        hospital.put("specialty", specialty);
        hospital.put("services", services);
        hospital.put("phone", "+1-555-" + (1000 + new Random().nextInt(9000)));
        hospital.put("address", "123 Medical Street, New York, NY");
        hospital.put("distance", 0.0); // Will be calculated
        hospital.put("rating", 4.0 + new Random().nextDouble());
        return hospital;
    }

    public Map<String, Object> findNearestHospitals(Long patientId, String analysisType, Double latitude, Double longitude) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Get patient location - use provided coordinates or default
        double patientLat = (latitude != null) ? latitude : 40.7128; // Default to NYC coordinates
        double patientLon = (longitude != null) ? longitude : -74.0060;

        // Determine required specialty based on analysis type
        String requiredSpecialty = determineSpecialty(analysisType);

        // Generate hospitals near patient location
        List<Map<String, Object>> nearbyHospitals = generateNearbyHospitals(patientLat, patientLon, requiredSpecialty);

        // Calculate distances - include all hospitals within 50km radius (no specialty filter)
        List<Map<String, Object>> hospitals = new ArrayList<>();
        for (Map<String, Object> hospital : nearbyHospitals) {
            double hospitalLat = (Double) hospital.get("latitude");
            double hospitalLon = (Double) hospital.get("longitude");
            double distance = calculateDistance(patientLat, patientLon, hospitalLat, hospitalLon);
            
            // Include all hospitals within 50km radius
            if (distance <= 50.0) {
                Map<String, Object> hospitalCopy = new HashMap<>(hospital);
                hospitalCopy.put("distance", Math.round(distance * 10.0) / 10.0);
                hospitals.add(hospitalCopy);
            }
        }

        // Sort by distance
        hospitals.sort(Comparator.comparing(h -> (Double) h.get("distance")));

        // Return top 10 nearest hospitals
        int maxHospitals = Math.min(10, hospitals.size());

        Map<String, Object> result = new HashMap<>();
        result.put("patient", Map.of(
                "id", patient.getId(),
                "name", patient.getFirstName() + " " + patient.getLastName(),
                "location", (patient.getCity() != null ? patient.getCity() : "") + 
                           (patient.getState() != null ? ", " + patient.getState() : "")
        ));
        result.put("analysisType", analysisType);
        result.put("requiredSpecialty", requiredSpecialty);
        result.put("hospitals", hospitals.subList(0, maxHospitals));
        result.put("patientCoordinates", Map.of("latitude", patientLat, "longitude", patientLon));

        return result;
    }

    // Real hospital data with proper details
    private static final Map<String, Map<String, Object>> REAL_HOSPITALS = new HashMap<>();
    
    static {
        // Common contact details
        String commonPhone = "+91-9428767709";
        String commonEmail = "ismailmansury9737@gmail.com";
        
        // Initialize real hospitals with proper names and contact details
        REAL_HOSPITALS.put("Shalby", createRealHospital("Shalby Hospitals", commonEmail, commonPhone, 
            "Shalby Advanced Robotic Institute, SG Highway, Ahmedabad, Gujarat", "Multi-specialty", 
            "Cardiac Surgery, Orthopedics, Oncology, Neurology, Emergency Care, Robotic Surgery"));
        
        REAL_HOSPITALS.put("VS", createRealHospital("VS Hospitals", commonEmail, commonPhone,
            "VS Hospitals, Nungambakkam, Chennai, Tamil Nadu", "Multi-specialty",
            "Cardiology, Oncology, Neurology, Orthopedics, Emergency Care, Critical Care"));
        
        REAL_HOSPITALS.put("Apollo", createRealHospital("Apollo Hospitals", commonEmail, commonPhone,
            "Apollo Hospitals, Greams Road, Chennai, Tamil Nadu", "Multi-specialty",
            "Cardiac Sciences, Oncology, Neurology, Orthopedics, Emergency, Critical Care, Transplant"));
        
        REAL_HOSPITALS.put("Narayana", createRealHospital("Narayana Health", commonEmail, commonPhone,
            "Narayana Health City, Bommasandra, Bangalore, Karnataka", "Multi-specialty",
            "Cardiac Sciences, Oncology, Neurology, Orthopedics, Emergency Care, Heart Transplant"));
        
        REAL_HOSPITALS.put("Sterling", createRealHospital("Sterling Hospitals", commonEmail, commonPhone,
            "Sterling Hospitals, Race Course Road, Vadodara, Gujarat", "Multi-specialty",
            "Cardiology, Oncology, Neurology, Orthopedics, Emergency Care, Critical Care"));
        
        REAL_HOSPITALS.put("Marengo CIMS", createRealHospital("Marengo CIMS Hospital", commonEmail, commonPhone,
            "Marengo CIMS Hospital, Science City Road, Ahmedabad, Gujarat", "Multi-specialty",
            "Cardiac Sciences, Oncology, Neurology, Orthopedics, Emergency, Critical Care, Trauma"));
        
        REAL_HOSPITALS.put("Zydus", createRealHospital("Zydus Hospitals", commonEmail, commonPhone,
            "Zydus Hospitals, Sola Road, Ahmedabad, Gujarat", "Multi-specialty",
            "Cardiology, Oncology, Neurology, Orthopedics, Emergency Care, Preventive Care"));
        
        REAL_HOSPITALS.put("HCG", createRealHospital("HCG Cancer Centre", commonEmail, commonPhone,
            "HCG Cancer Centre, K R Road, Bangalore, Karnataka", "Oncology",
            "Medical Oncology, Radiation Oncology, Surgical Oncology, Bone Marrow Transplant, Cancer Research"));
    }
    
    private static Map<String, Object> createRealHospital(String name, String email, String phone, 
            String address, String specialty, String services) {
        Map<String, Object> hospital = new HashMap<>();
        hospital.put("name", name);
        hospital.put("email", email);
        hospital.put("phone", phone);
        hospital.put("address", address);
        hospital.put("specialty", specialty);
        hospital.put("services", services);
        hospital.put("rating", 4.2 + new Random().nextDouble() * 0.8); // Rating between 4.2-5.0
        return hospital;
    }

    // Generate hospitals near patient location using real hospital names
    private List<Map<String, Object>> generateNearbyHospitals(double centerLat, double centerLon, String requiredSpecialty) {
        List<Map<String, Object>> hospitals = new ArrayList<>();
        Random random = new Random();
        
        // Use real hospital names
        List<String> hospitalNames = new ArrayList<>(REAL_HOSPITALS.keySet());
        Collections.shuffle(hospitalNames);
        
        // Generate 8 hospitals in a radius around patient
        int hospitalCount = Math.min(8, hospitalNames.size());
        
        for (int i = 0; i < hospitalCount; i++) {
            // Generate random location within 30km radius
            double angle = random.nextDouble() * 2 * Math.PI;
            double radius = random.nextDouble() * 30.0; // Max 30km radius
            double latOffset = radius * Math.cos(angle) / 111.0; // ~111km per degree latitude
            double lonOffset = radius * Math.sin(angle) / (111.0 * Math.cos(Math.toRadians(centerLat)));
            
            double hospitalLat = centerLat + latOffset;
            double hospitalLon = centerLon + lonOffset;
            
            // Get real hospital data
            String hospitalKey = hospitalNames.get(i);
            Map<String, Object> realHospitalData = REAL_HOSPITALS.get(hospitalKey);
            
            // Create hospital with real data
            Map<String, Object> hospital = new HashMap<>();
            hospital.put("id", UUID.randomUUID().toString());
            hospital.put("name", realHospitalData.get("name"));
            hospital.put("email", realHospitalData.get("email"));
            hospital.put("phone", realHospitalData.get("phone"));
            hospital.put("address", realHospitalData.get("address"));
            hospital.put("specialty", realHospitalData.get("specialty"));
            hospital.put("services", realHospitalData.get("services"));
            hospital.put("rating", realHospitalData.get("rating"));
            hospital.put("latitude", hospitalLat);
            hospital.put("longitude", hospitalLon);
            hospital.put("distance", 0.0); // Will be calculated
            
            hospitals.add(hospital);
        }
        
        return hospitals;
    }
    
    private String getRandomStreetName() {
        String[] streets = {"Main St", "Oak Ave", "Park Blvd", "Medical Dr", "Health Way", 
                           "Hospital Rd", "Care Lane", "Wellness Blvd", "Medical Center Dr"};
        return streets[new Random().nextInt(streets.length)];
    }
    
    private String getCityFromCoordinates(double lat, double lon) {
        // Approximate city based on coordinates (simplified)
        if (lat >= 40.0 && lat <= 41.0 && lon >= -74.5 && lon <= -73.5) {
            return "New York";
        } else if (lat >= 34.0 && lat <= 35.0 && lon >= -118.5 && lon <= -118.0) {
            return "Los Angeles";
        } else if (lat >= 41.5 && lat <= 42.0 && lon >= -87.5 && lon <= -87.0) {
            return "Chicago";
        } else if (lat >= 29.5 && lat <= 30.0 && lon >= -95.5 && lon <= -95.0) {
            return "Houston";
        }
        return "City";
    }
    
    private String getStateFromCoordinates(double lat, double lon) {
        // Approximate state based on coordinates (simplified)
        if (lat >= 40.0 && lat <= 41.0 && lon >= -74.5 && lon <= -73.5) {
            return "NY";
        } else if (lat >= 34.0 && lat <= 35.0 && lon >= -118.5 && lon <= -118.0) {
            return "CA";
        } else if (lat >= 41.5 && lat <= 42.0 && lon >= -87.5 && lon <= -87.0) {
            return "IL";
        } else if (lat >= 29.5 && lat <= 30.0 && lon >= -95.5 && lon <= -95.0) {
            return "TX";
        }
        return "State";
    }

    private String determineSpecialty(String analysisType) {
        if (analysisType == null) return "General";
        
        String type = analysisType.toLowerCase();
        if (type.contains("heart") || type.contains("ecg") || type.contains("cardiac")) {
            return "Cardiology";
        } else if (type.contains("brain") || type.contains("mri") || type.contains("tumor") || type.contains("neurological")) {
            return "Neurology";
        } else if (type.contains("cancer") || type.contains("oncology")) {
            return "Oncology";
        } else if (type.contains("diabetes") || type.contains("blood")) {
            return "Endocrinology";
        } else if (type.contains("tb") || type.contains("tuberculosis") || type.contains("lung")) {
            return "Pulmonology";
        }
        return "General";
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula for calculating distance between two points
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }
    
    public void sendPatientProfileToHospital(Long patientId, String hospitalEmail, boolean isEmergency) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        // Get latest AI analysis
        Optional<AIAnalysis> latestAnalysis = aiAnalysisRepository.findTopByPatientIdOrderByCreatedAtDesc(patientId);
        
        emailService.sendPatientProfileToHospital(
            hospitalEmail, 
            patient, 
            latestAnalysis.orElse(null), 
            isEmergency
        );
    }
}


