package com.novachat.ai.dto;

import java.time.LocalDateTime;
import java.util.List;

public record SessionDetailDto(
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
    List<ChatQuestionResponse> questions
) {}
