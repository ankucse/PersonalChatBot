package com.novachat.ai.controller;

import com.novachat.ai.dto.*;
import com.novachat.ai.service.AdminService;
import com.novachat.ai.service.GeminiAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final GeminiAiService geminiAiService;

    public AdminController(AdminService adminService, GeminiAiService geminiAiService) {
        this.adminService = adminService;
        this.geminiAiService = geminiAiService;
    }

    /**
     * SaaS Dashboard metrics overview
     */
    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsDto> getMetrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }

    /**
     * Retrieve all chat sessions by all users
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionSummaryDto>> getAllSessions() {
        return ResponseEntity.ok(adminService.getAllSessions());
    }

    /**
     * Inspect a specific user session and view every question and AI answer
     */
    @GetMapping("/sessions/{sessionUuid}")
    public ResponseEntity<SessionDetailDto> getSessionDetail(@PathVariable String sessionUuid) {
        return ResponseEntity.ok(adminService.getSessionDetail(sessionUuid));
    }

    /**
     * Retrieve all registered users and their session counters
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserSummaryDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /**
     * Get Gemini AI status and config
     */
    @GetMapping("/config")
    public ResponseEntity<SystemConfigDto> getSystemConfig() {
        return ResponseEntity.ok(adminService.getSystemConfig());
    }

    /**
     * Update Gemini API Key live
     */
    @PostMapping("/config/key")
    public ResponseEntity<Map<String, String>> updateApiKey(@RequestBody Map<String, String> payload) {
        String key = payload.get("apiKey");
        if (key != null) {
            geminiAiService.updateApiKey(key.trim());
            return ResponseEntity.ok(Map.of("message", "Gemini API Key updated successfully."));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Key cannot be null"));
    }

    /**
     * Update Gemini model
     */
    @PostMapping("/config/model")
    public ResponseEntity<Map<String, String>> updateModel(@RequestBody Map<String, String> payload) {
        String model = payload.get("model");
        if (model != null && !model.isBlank()) {
            geminiAiService.updateModel(model.trim());
            return ResponseEntity.ok(Map.of("message", "Gemini model updated to: " + model));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Model cannot be blank"));
    }
}
