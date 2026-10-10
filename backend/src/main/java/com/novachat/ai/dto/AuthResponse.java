package com.novachat.ai.dto;

public record AuthResponse(
    String token,
    String tokenType,
    String username,
    String email,
    String fullName,
    String role
) {
    public AuthResponse(String token, String username, String email, String fullName, String role) {
        this(token, "Bearer", username, email, fullName, role);
    }
}
