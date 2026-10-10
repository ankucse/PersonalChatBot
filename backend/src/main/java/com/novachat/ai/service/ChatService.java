package com.novachat.ai.service;

import com.novachat.ai.dto.ChatQuestionRequest;
import com.novachat.ai.dto.ChatQuestionResponse;
import com.novachat.ai.dto.CreateSessionResponse;
import com.novachat.ai.model.ChatQuestion;
import com.novachat.ai.model.ChatSession;
import com.novachat.ai.model.User;
import com.novachat.ai.repository.ChatQuestionRepository;
import com.novachat.ai.repository.ChatSessionRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatQuestionRepository questionRepository;
    private final GeminiAiService geminiAiService;

    public ChatService(ChatSessionRepository sessionRepository,
                       ChatQuestionRepository questionRepository,
                       GeminiAiService geminiAiService) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.geminiAiService = geminiAiService;
    }

    @Transactional
    public CreateSessionResponse createSession(User user) {
        ChatSession session = new ChatSession(user);
        session = sessionRepository.save(session);
        return new CreateSessionResponse(
                session.getSessionUuid(),
                session.getStartedAt(),
                session.getTitle(),
                session.getStatus()
        );
    }

    @Transactional
    public ChatQuestionResponse askQuestion(User user, ChatQuestionRequest request) {
        ChatSession session = sessionRepository.findBySessionUuid(request.sessionUuid())
                .orElseThrow(() -> new IllegalArgumentException("Chat session not found: " + request.sessionUuid()));

        // Security check: Verify session ownership
        if (!session.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized: You do not own this chat session.");
        }

        int nextQuestionNumber = session.getQuestions().size() + 1;

        // Call Gemini AI
        GeminiAiService.AiGenerationResult aiResult = geminiAiService.generateAnswer(request.question());

        // Update session title on first question for intuitive identification
        if (nextQuestionNumber == 1) {
            String snippet = request.question().trim();
            if (snippet.length() > 36) {
                snippet = snippet.substring(0, 36) + "...";
            }
            session.setTitle(snippet);
        }

        ChatQuestion chatQuestion = new ChatQuestion(
                session,
                nextQuestionNumber,
                request.question(),
                aiResult.answer(),
                aiResult.latencyMs(),
                aiResult.modelUsed(),
                aiResult.estimatedTokens()
        );

        session.addQuestion(chatQuestion);
        chatQuestion = questionRepository.save(chatQuestion);
        sessionRepository.save(session);

        return new ChatQuestionResponse(
                chatQuestion.getId(),
                chatQuestion.getQuestionNumber(),
                chatQuestion.getQuestionText(),
                chatQuestion.getResponseText(),
                chatQuestion.getAskedAt(),
                chatQuestion.getResponseTimeMs(),
                chatQuestion.getModelUsed(),
                chatQuestion.getTokensEstimated()
        );
    }

    @Transactional
    public void closeSession(User user, String sessionUuid) {
        ChatSession session = sessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new IllegalArgumentException("Chat session not found: " + sessionUuid));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized: You do not own this chat session.");
        }

        session.setStatus("CLOSED");
        session.setEndedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }
}
