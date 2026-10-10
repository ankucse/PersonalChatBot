package com.novachat.ai.dto;

public record UserProfileDto(
    Long id,
    String username,
    String email,
    String fullName,
    String role
) {}
