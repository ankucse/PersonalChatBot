package com.novachat.ai.service;

import com.novachat.ai.config.GeminiProperties;
import com.novachat.ai.dto.*;
import com.novachat.ai.model.ChatQuestion;
import com.novachat.ai.model.ChatSession;
import com.novachat.ai.model.User;
import com.novachat.ai.repository.ChatQuestionRepository;
import com.novachat.ai.repository.ChatSessionRepository;
import com.novachat.ai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class AdminService {

    private static final String UNKNOWN = "Unknown";

    private final UserRepository userRepository;
    private final ChatSessionRepository sessionRepository;
    private final ChatQuestionRepository questionRepository;
    private final GeminiProperties geminiProperties;

    public AdminService(UserRepository userRepository,
                        ChatSessionRepository sessionRepository,
                        ChatQuestionRepository questionRepository,
                        GeminiProperties geminiProperties) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.geminiProperties = geminiProperties;
    }

    @Transactional(readOnly = true)
    public List<SessionSummaryDto> getAllSessions() {
        List<ChatSession> sessions = sessionRepository.findAllByOrderByStartedAtDesc();

        return sessions.stream().map(session -> {
            User user = session.getUser();
            String firstExcerpt = "";
            String lastExcerpt = "";
            List<ChatQuestion> questions = session.getQuestions();

            if (!questions.isEmpty()) {
                firstExcerpt = truncate(questions.get(0).getQuestionText(), 60);
                lastExcerpt = truncate(questions.get(questions.size() - 1).getQuestionText(), 60);
            }

            return new SessionSummaryDto(
                    session.getSessionUuid(),
                    user != null ? user.getId() : null,
                    user != null ? user.getUsername() : UNKNOWN,
                    user != null ? user.getEmail() : UNKNOWN,
                    user != null ? user.getFullName() : UNKNOWN,
                    session.getTitle(),
                    session.getStartedAt(),
                    session.getEndedAt(),
                    session.getStatus(),
                    session.getTotalQuestions(),
                    firstExcerpt,
                    lastExcerpt
            );
        }).toList();
    }

    @Transactional(readOnly = true)
    public SessionDetailDto getSessionDetail(String sessionUuid) {
        ChatSession session = sessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionUuid));

        User user = session.getUser();
        List<ChatQuestionResponse> questionDtos = session.getQuestions().stream()
                .map(q -> new ChatQuestionResponse(
                        q.getId(),
                        q.getQuestionNumber(),
                        q.getQuestionText(),
                        q.getResponseText(),
                        q.getAskedAt(),
                        q.getResponseTimeMs(),
                        q.getModelUsed(),
                        q.getTokensEstimated()
                )).toList();

        return new SessionDetailDto(
                session.getSessionUuid(),
                user != null ? user.getId() : null,
                user != null ? user.getUsername() : UNKNOWN,
                user != null ? user.getEmail() : UNKNOWN,
                user != null ? user.getFullName() : UNKNOWN,
                session.getTitle(),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getStatus(),
                session.getTotalQuestions(),
                questionDtos
        );
    }

    @Transactional(readOnly = true)
    public AdminMetricsDto getMetrics() {
        long totalUsers = userRepository.count();
        long totalSessions = sessionRepository.count();
        long activeSessions = sessionRepository.countByStatus("ACTIVE");
        long totalQuestions = questionRepository.count();

        LocalDateTime startOfToday = LocalDate.now(ZoneId.systemDefault()).atStartOfDay();
        long questionsToday = questionRepository.countByAskedAtAfter(startOfToday);

        Double avgResponseTime = questionRepository.getAverageResponseTime();
        Long totalTokens = questionRepository.getTotalTokensEstimated();

        return new AdminMetricsDto(
                totalUsers,
                totalSessions,
                activeSessions,
                totalQuestions,
                questionsToday,
                avgResponseTime != null ? Math.round(avgResponseTime * 10.0) / 10.0 : 0.0,
                totalTokens != null ? totalTokens : 0L,
                geminiProperties.getModel()
        );
    }

    @Transactional(readOnly = true)
    public List<AdminUserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            long sessions = sessionRepository.countSessionsByUserId(user.getId());
            return new AdminUserSummaryDto(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name(),
                    user.getCreatedAt(),
                    user.getLastLoginAt(),
                    sessions
            );
        }).toList();
    }

    @Transactional(readOnly = true)
    public SystemConfigDto getSystemConfig() {
        return new SystemConfigDto(
                geminiProperties.isKeyConfigured(),
                geminiProperties.getModel(),
                geminiProperties.getMaxOutputTokens(),
                geminiProperties.getTemperature(),
                !geminiProperties.isKeyConfigured(),
                geminiProperties.getMaskedApiKey()
        );
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max) + "...";
    }
}
