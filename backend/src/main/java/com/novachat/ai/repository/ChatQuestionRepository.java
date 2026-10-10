package com.novachat.ai.repository;

import com.novachat.ai.model.ChatQuestion;
import com.novachat.ai.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatQuestionRepository extends JpaRepository<ChatQuestion, Long> {
    List<ChatQuestion> findByChatSessionOrderByQuestionNumberAsc(ChatSession chatSession);
    long countByAskedAtAfter(LocalDateTime dateTime);

    @Query("SELECT AVG(q.responseTimeMs) FROM ChatQuestion q WHERE q.responseTimeMs IS NOT NULL")
    Double getAverageResponseTime();

    @Query("SELECT SUM(q.tokensEstimated) FROM ChatQuestion q WHERE q.tokensEstimated IS NOT NULL")
    Long getTotalTokensEstimated();

    List<ChatQuestion> findTop10ByOrderByAskedAtDesc();
}
