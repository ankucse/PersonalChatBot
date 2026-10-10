package com.novachat.ai.dto;

public record SystemConfigDto(
    boolean geminiKeyConfigured,
    String geminiModel,
    int maxTokens,
    double temperature,
    boolean isMockFallback,
    String maskedApiKey
) {}
