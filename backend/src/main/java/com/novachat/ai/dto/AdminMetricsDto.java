package com.novachat.ai.dto;

public record AdminMetricsDto(
    long totalUsers,
    long totalSessions,
    long activeSessions,
    long totalQuestions,
    long questionsToday,
    Double averageResponseTimeMs,
    Long totalEstimatedTokens,
    String aiModel
) {}
