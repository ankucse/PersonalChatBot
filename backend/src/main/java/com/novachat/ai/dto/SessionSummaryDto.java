package com.novachat.ai.dto;

import java.time.LocalDateTime;

public record SessionSummaryDto(
    String sessionUuid,
    Long userId,
    String username,
    String userEmail,
    String userFullName,
    String title,
    LocalDateTime startedAt,
    LocalDateTime endedAt,
    String status,
    Integer totalQuestions,
    String firstQuestionExcerpt,
    String lastQuestionExcerpt
) {}
