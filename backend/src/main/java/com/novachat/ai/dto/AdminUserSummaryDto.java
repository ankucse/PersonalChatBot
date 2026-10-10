package com.novachat.ai.dto;

import java.time.LocalDateTime;

public record AdminUserSummaryDto(
    Long id,
    String username,
    String email,
    String fullName,
    String role,
    LocalDateTime createdAt,
    LocalDateTime lastLoginAt,
    long sessionCount
) {}
