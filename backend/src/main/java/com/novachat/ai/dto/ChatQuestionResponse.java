package com.novachat.ai.dto;

import java.time.LocalDateTime;

public record ChatQuestionResponse(
    Long id,
    Integer questionNumber,
    String questionText,
    String responseText,
    LocalDateTime askedAt,
    Long responseTimeMs,
    String modelUsed,
    Integer tokensEstimated
) {}
