package com.novachat.ai.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHAT_QUESTIONS", indexes = {
    @Index(name = "IDX_Q_SESSION", columnList = "session_id"),
    @Index(name = "IDX_Q_ASKED", columnList = "askedAt")
})
public class ChatQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private ChatSession chatSession;

    @Column(nullable = false)
    private Integer questionNumber;

    @Lob
    @Column(name = "QUESTION_TEXT", nullable = false, columnDefinition = "LONGTEXT")
    private String questionText;

    @Lob
    @Column(name = "RESPONSE_TEXT", columnDefinition = "LONGTEXT")
    private String responseText;

    @Column(nullable = false)
    private LocalDateTime askedAt;

    private Long responseTimeMs;

    @Column(length = 50)
    private String modelUsed;

    private Integer tokensEstimated;

    public ChatQuestion() {
    }

    public ChatQuestion(ChatSession chatSession, Integer questionNumber, String questionText,
                        String responseText, Long responseTimeMs, String modelUsed, Integer tokensEstimated) {
        this.chatSession = chatSession;
        this.questionNumber = questionNumber;
        this.questionText = questionText;
        this.responseText = responseText;
        this.askedAt = LocalDateTime.now();
        this.responseTimeMs = responseTimeMs;
        this.modelUsed = modelUsed;
        this.tokensEstimated = tokensEstimated;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatSession getChatSession() {
        return chatSession;
    }

    public void setChatSession(ChatSession chatSession) {
        this.chatSession = chatSession;
    }

    public Integer getQuestionNumber() {
        return questionNumber;
    }

    public void setQuestionNumber(Integer questionNumber) {
        this.questionNumber = questionNumber;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getResponseText() {
        return responseText;
    }

    public void setResponseText(String responseText) {
        this.responseText = responseText;
    }

    public LocalDateTime getAskedAt() {
        return askedAt;
    }

    public void setAskedAt(LocalDateTime askedAt) {
        this.askedAt = askedAt;
    }

    public Long getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(Long responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }

    public Integer getTokensEstimated() {
        return tokensEstimated;
    }

    public void setTokensEstimated(Integer tokensEstimated) {
        this.tokensEstimated = tokensEstimated;
    }
}
