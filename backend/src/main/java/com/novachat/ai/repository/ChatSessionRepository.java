package com.novachat.ai.repository;

import com.novachat.ai.model.ChatSession;
import com.novachat.ai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findBySessionUuid(String sessionUuid);
    List<ChatSession> findByUserOrderByStartedAtDesc(User user);
    List<ChatSession> findAllByOrderByStartedAtDesc();
    long countByStatus(String status);
    long countByUser(User user);

    @Query("SELECT COUNT(s) FROM ChatSession s WHERE s.user.id = :userId")
    long countSessionsByUserId(Long userId);
}
