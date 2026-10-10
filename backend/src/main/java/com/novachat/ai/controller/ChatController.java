package com.novachat.ai.controller;

import com.novachat.ai.dto.ChatQuestionRequest;
import com.novachat.ai.dto.ChatQuestionResponse;
import com.novachat.ai.dto.CreateSessionResponse;
import com.novachat.ai.security.CustomUserDetails;
import com.novachat.ai.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Start a fresh chatbot session for the authenticated user.
     * User can only chat within the active session; historical session lists are kept private from standard users.
     */
    @PostMapping("/session")
    public ResponseEntity<CreateSessionResponse> createSession(@AuthenticationPrincipal CustomUserDetails userDetails) {
        CreateSessionResponse response = chatService.createSession(userDetails.getUser());
        return ResponseEntity.ok(response);
    }

    /**
     * Submit a question in the active session. Powered by Gemini AI and logged to Oracle DB.
     */
    @PostMapping("/question")
    public ResponseEntity<ChatQuestionResponse> askQuestion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChatQuestionRequest request) {
        ChatQuestionResponse response = chatService.askQuestion(userDetails.getUser(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * End the current session.
     */
    @PostMapping("/session/{sessionUuid}/close")
    public ResponseEntity<Map<String, String>> closeSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String sessionUuid) {
        chatService.closeSession(userDetails.getUser(), sessionUuid);
        return ResponseEntity.ok(Map.of("message", "Session closed successfully", "sessionUuid", sessionUuid));
    }
}
