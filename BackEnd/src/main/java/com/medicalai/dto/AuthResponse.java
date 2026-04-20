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
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
}
