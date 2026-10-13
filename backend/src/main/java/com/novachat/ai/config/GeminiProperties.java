package com.novachat.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "gemini")
public class GeminiProperties {

    /**
     * Google Gemini API Key. Can be supplied via GEMINI_API_KEY environment variable.
     */
    private String apiKey = "";

    /**
     * Gemini model name (e.g. gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash)
     */
    private String model = "gemini-1.5-flash";

    /**
     * Sampling temperature between 0.0 and 2.0
     */
    private Double temperature = 0.7;

    /**
     * Maximum generation tokens
     */
    private Integer maxOutputTokens = 2048;

    /**
     * System instructions given to Gemini
     */
    private String systemPrompt = "You are NovaChat AI, an enterprise-grade AI chatbot built for modern software platforms. Provide clear, accurate, structured, and insightful answers with markdown formatting where appropriate.";

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getMaxOutputTokens() {
        return maxOutputTokens;
    }

    public void setMaxOutputTokens(Integer maxOutputTokens) {
        this.maxOutputTokens = maxOutputTokens;
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }

    public boolean isKeyConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY_HERE");
    }

    public String getMaskedApiKey() {
        if (!isKeyConfigured()) {
            return "Not Configured";
        }
        if (apiKey.length() <= 8) {
            return "••••••••";
        }
        return apiKey.substring(0, 4) + "••••••••" + apiKey.substring(apiKey.length() - 4);
    }
}
