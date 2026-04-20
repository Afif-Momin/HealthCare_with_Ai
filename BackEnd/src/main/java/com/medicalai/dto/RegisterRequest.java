package com.medicalai.dto;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String role;
    private String phone;
    // Doctor
    private String specialization;
    private String licenseNumber;
    private String department;
    // Nurse
    private String ward;
    private String shift;
    // Patient
    private String dateOfBirth;
    private String bloodGroup;
    private String address;
    private String gender;
    private Double height;
    private Double weight;
    private String allergies;
    private String medicalHistorySummary;
    private String emergencyContactName;
    private String emergencyContactPhone;

    public String getFullName() { return fullName; }
    public void setFullName(String v) { this.fullName = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getPassword() { return password; }
    public void setPassword(String v) { this.password = v; }
    public String getRole() { return role; }
    public void setRole(String v) { this.role = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String v) { this.specialization = v; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String v) { this.licenseNumber = v; }
    public String getDepartment() { return department; }
    public void setDepartment(String v) { this.department = v; }
    public String getWard() { return ward; }
    public void setWard(String v) { this.ward = v; }
    public String getShift() { return shift; }
    public void setShift(String v) { this.shift = v; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String v) { this.dateOfBirth = v; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String v) { this.bloodGroup = v; }
    public String getAddress() { return address; }
    public void setAddress(String v) { this.address = v; }
    public String getGender() { return gender; }
    public void setGender(String v) { this.gender = v; }
    public Double getHeight() { return height; }
    public void setHeight(Double v) { this.height = v; }
    public Double getWeight() { return weight; }
    public void setWeight(Double v) { this.weight = v; }
    public String getAllergies() { return allergies; }
    public void setAllergies(String v) { this.allergies = v; }
    public String getMedicalHistorySummary() { return medicalHistorySummary; }
    public void setMedicalHistorySummary(String v) { this.medicalHistorySummary = v; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String v) { this.emergencyContactName = v; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String v) { this.emergencyContactPhone = v; }
}
