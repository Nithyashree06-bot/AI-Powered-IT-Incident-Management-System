package com.incidentiq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.incidentiq.dto.IncidentClassificationDTO;
import com.incidentiq.entity.Severity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final String apiKey;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiService(@Value("${gemini.api.key:}") String apiKey) {
        this.apiKey = apiKey;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public IncidentClassificationDTO classifyIncident(String description) {
        if (description == null || description.trim().isEmpty()) {
            return getDefaultFallback();
        }

        if (apiKey == null || apiKey.trim().isEmpty() || "your_gemini_api_key".equalsIgnoreCase(apiKey.trim())) {
            log.warn("Gemini API key is not configured or using placeholder; using heuristic fallback.");
            return classifyWithHeuristicOrFallback(description);
        }

        try {
            String prompt = String.format(
                    "You are an IT incident classifier. Classify the following IT incident " +
                    "description and respond ONLY in this exact JSON format, nothing else:\n" +
                    "{\n" +
                    "  \"severity\": \"CRITICAL|HIGH|MEDIUM|LOW\",\n" +
                    "  \"category\": \"Network|Hardware|Software|Security\",\n" +
                    "  \"resolution_steps\": [\"step 1\", \"step 2\", \"step 3\"]\n" +
                    "}\n" +
                    "Incident: %s",
                    description.replace("\"", "\\\"")
            );

            String requestBody = objectMapper.writeValueAsString(
                    java.util.Map.of(
                            "contents", java.util.List.of(
                                    java.util.Map.of(
                                            "parts", java.util.List.of(
                                                    java.util.Map.of("text", prompt)
                                            )
                                    )
                            )
                    )
            );

            // Google Gemini API endpoint (gemini-2.5-flash or gemini-1.5-flash)
            URI uri = URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    String rawText = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                    return parseGeminiResponse(rawText);
                }
            } else {
                log.warn("Gemini API returned HTTP status {}: {}", response.statusCode(), response.body());
            }

        } catch (Exception e) {
            log.error("Failed to invoke Gemini API: {}", e.getMessage(), e);
        }

        // Return fallback on any failure as specified in Rule 7
        return getDefaultFallback();
    }

    private IncidentClassificationDTO parseGeminiResponse(String rawText) {
        try {
            // Clean markdown code blocks if returned
            String cleanedJson = rawText.trim();
            if (cleanedJson.startsWith("```json")) {
                cleanedJson = cleanedJson.substring(7);
            } else if (cleanedJson.startsWith("```")) {
                cleanedJson = cleanedJson.substring(3);
            }
            if (cleanedJson.endsWith("```")) {
                cleanedJson = cleanedJson.substring(0, cleanedJson.length() - 3);
            }
            cleanedJson = cleanedJson.trim();

            JsonNode node = objectMapper.readTree(cleanedJson);

            String sevStr = node.path("severity").asText("MEDIUM").toUpperCase();
            Severity severity;
            try {
                severity = Severity.valueOf(sevStr);
            } catch (Exception e) {
                severity = Severity.MEDIUM;
            }

            String category = node.path("category").asText("Software");

            List<String> steps = new ArrayList<>();
            JsonNode stepsNode = node.path("resolution_steps");
            if (stepsNode.isArray()) {
                for (JsonNode step : stepsNode) {
                    steps.add(step.asText());
                }
            }

            if (steps.isEmpty()) {
                steps.add("Investigate system event logs and diagnostic dumps.");
                steps.add("Validate service status and execute remediation.");
            }

            return IncidentClassificationDTO.builder()
                    .severity(severity)
                    .category(category)
                    .resolutionSteps(steps)
                    .build();

        } catch (Exception e) {
            log.warn("Failed to parse Gemini response JSON: {}. Using default fallback.", e.getMessage());
            return getDefaultFallback();
        }
    }

    public IncidentClassificationDTO getDefaultFallback() {
        return IncidentClassificationDTO.builder()
                .severity(Severity.MEDIUM)
                .category("Software")
                .resolutionSteps(List.of("Manual classification required"))
                .build();
    }

    private IncidentClassificationDTO classifyWithHeuristicOrFallback(String desc) {
        String lower = desc.toLowerCase();
        Severity severity = Severity.MEDIUM;
        String category = "Software";
        List<String> steps = new ArrayList<>();

        if (lower.contains("switch") || lower.contains("router") || lower.contains("vpn") || lower.contains("network") || lower.contains("packet loss") || lower.contains("dns")) {
            category = "Network";
            if (lower.contains("outage") || lower.contains("offline") || lower.contains("down") || lower.contains("crash")) {
                severity = Severity.CRITICAL;
                steps.add("Check physical uplink cables and core rack power distribution.");
                steps.add("Access serial management console to check port flap and trunk saturation.");
                steps.add("Initiate failover gateway redundancy routes to secondary switch.");
            } else {
                severity = Severity.HIGH;
                steps.add("Test ICMP ping reachability and traceroute hop latency.");
                steps.add("Verify DNS resolution and DHCP lease pool capacity.");
                steps.add("Restart network adapter interface and monitor packet retransmissions.");
            }
        } else if (lower.contains("breach") || lower.contains("hack") || lower.contains("ransomware") || lower.contains("unauthorized") || lower.contains("malware") || lower.contains("ddos")) {
            category = "Security";
            severity = Severity.CRITICAL;
            steps.add("Immediately isolate host or subnet from corporate network.");
            steps.add("Preserve active memory dump and firewall access logs for forensic analysis.");
            steps.add("Revoke affected user credentials and initiate key rotation protocol.");
        } else if (lower.contains("monitor") || lower.contains("screen") || lower.contains("keyboard") || lower.contains("mouse") || lower.contains("printer") || lower.contains("ram") || lower.contains("disk") || lower.contains("motherboard")) {
            category = "Hardware";
            severity = lower.contains("server") || lower.contains("raid") ? Severity.HIGH : Severity.LOW;
            steps.add("Perform hardware diagnostics and reseat physical cable connections.");
            steps.add("Verify power delivery and check peripheral device drivers.");
            steps.add("Replace faulty hardware component or dispatch bench technician.");
        } else {
            category = "Software";
            severity = lower.contains("database") || lower.contains("production") ? Severity.HIGH : Severity.MEDIUM;
            steps.add("Inspect application error logs and stack traces.");
            steps.add("Verify running dependencies, environment variables, and background services.");
            steps.add("Clear application cache and restart worker processes.");
        }

        return IncidentClassificationDTO.builder()
                .severity(severity)
                .category(category)
                .resolutionSteps(steps)
                .build();
    }
}
