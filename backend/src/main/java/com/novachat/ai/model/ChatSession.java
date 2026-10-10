package com.novachat.ai.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "CHAT_SESSIONS", indexes = {
    @Index(name = "IDX_SESS_UUID", columnList = "sessionUuid", unique = true),
    @Index(name = "IDX_SESS_USER", columnList = "user_id"),
    @Index(name = "IDX_SESS_STARTED", columnList = "startedAt")
})
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String sessionUuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(length = 255)
    private String title;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false)
    private Integer totalQuestions = 0;

    @OneToMany(mappedBy = "chatSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionNumber ASC")
    private List<ChatQuestion> questions = new ArrayList<>();

    public ChatSession() {
    }

    public ChatSession(User user) {
        this.user = user;
        this.sessionUuid = "ses_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        this.startedAt = LocalDateTime.now(ZoneId.systemDefault());
        this.status = "ACTIVE";
        this.totalQuestions = 0;
        this.title = "Chat Session " + startedAt.toLocalTime().toString().substring(0, 5);
    }

    public void addQuestion(ChatQuestion question) {
        questions.add(question);
        question.setChatSession(this);
        this.totalQuestions = questions.size();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSessionUuid() {
        return sessionUuid;
    }

    public void setSessionUuid(String sessionUuid) {
        this.sessionUuid = sessionUuid;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public List<ChatQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<ChatQuestion> questions) {
        this.questions = questions;
    }
}
