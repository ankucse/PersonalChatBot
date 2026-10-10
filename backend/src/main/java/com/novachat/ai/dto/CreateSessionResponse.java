package com.novachat.ai.dto;

import java.time.LocalDateTime;

public record CreateSessionResponse(
    String sessionUuid,
    LocalDateTime startedAt,
    String title,
    String status
) {}
