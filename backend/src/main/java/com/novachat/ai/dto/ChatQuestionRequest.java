package com.novachat.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatQuestionRequest(
    @NotBlank(message = "Session UUID is required")
    String sessionUuid,

    @NotBlank(message = "Question text cannot be empty")
    @Size(max = 8000, message = "Question is too long")
    String question
) {}
