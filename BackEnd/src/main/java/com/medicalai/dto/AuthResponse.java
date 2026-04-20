package com.medicalai.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String email;
    private String fullName;
    private Long userId;
    private String message;
    private boolean success;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(String token, String role, String email, String fullName, Long userId) {
        this.token = token;
        this.role = role;
        this.email = email;
        this.fullName = fullName;
        this.userId = userId;
        this.success = true;
    }

    public String getToken() { return token; }
    public void setToken(String v) { this.token = v; }
    public String getRole() { return role; }
    public void setRole(String v) { this.role = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getFullName() { return fullName; }
    public void setFullName(String v) { this.fullName = v; }
    public Long getUserId() { return userId; }
    public void setUserId(Long v) { this.userId = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean v) { this.success = v; }
}
