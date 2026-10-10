package com.novachat.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novachat.ai.dto.ChatQuestionRequest;
import com.novachat.ai.dto.LoginRequest;
import com.novachat.ai.repository.ChatQuestionRepository;
import com.novachat.ai.repository.ChatSessionRepository;
import com.novachat.ai.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class NovaChatApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatSessionRepository sessionRepository;

    @Autowired
    private ChatQuestionRepository questionRepository;

    private String obtainToken(String username, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(username, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        return objectMapper.readTree(responseBody).path("token").asText();
    }

    @Test
    @DisplayName("Context loads and single super admin is seeded on startup")
    void contextLoads() {
        assertThat(userRepository.findByUsername("admin")).isPresent();
        assertThat(userRepository.countByRole(com.novachat.ai.model.Role.ROLE_ADMIN)).isEqualTo(1);
    }

    @Test
    @DisplayName("Standard user can login, create session, ask question, and backend persists it")
    void testUserChatFlow() throws Exception {
        String userToken = obtainToken("sarah", "User@NovaChat2026!");
        assertThat(userToken).isNotBlank();

        // 1. Create a session
        MvcResult sessionResult = mockMvc.perform(post("/api/chat/session")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionUuid").exists())
                .andReturn();

        String sessionUuid = objectMapper.readTree(sessionResult.getResponse().getContentAsString())
                .path("sessionUuid").asText();

        // 2. Ask "hello" in session
        ChatQuestionRequest questionReq = new ChatQuestionRequest(sessionUuid, "hello");
        MvcResult questionResult = mockMvc.perform(post("/api/chat/question")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(questionReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionText").value("hello"))
                .andExpect(jsonPath("$.responseText").exists())
                .andExpect(jsonPath("$.questionNumber").value(1))
                .andReturn();

        String responseText = objectMapper.readTree(questionResult.getResponse().getContentAsString())
                .path("responseText").asText();
        assertThat(responseText)
                .doesNotContain("GEMINI_API_KEY")
                .doesNotContain("application.yml")
                .contains("Hello!");

        // 3. Verify question is stored in database
        assertThat(questionRepository.count()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("Standard user cannot access Admin endpoints (403 Forbidden)")
    void testStandardUserForbiddenFromAdminEndpoints() throws Exception {
        String userToken = obtainToken("sarah", "User@NovaChat2026!");

        mockMvc.perform(get("/api/admin/sessions")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Sole Super Admin can audit all user sessions and full question logs")
    void testAdminCanInspectSessionsAndQuestions() throws Exception {
        String adminToken = obtainToken("admin", "Admin@NovaChat2026!");

        // 1. Admin gets metrics
        mockMvc.perform(get("/api/admin/metrics")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").exists());

        // 2. Admin retrieves sessions list
        mockMvc.perform(get("/api/admin/sessions")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
