package com.incidentiq;

import com.incidentiq.dto.IncidentClassificationDTO;
import com.incidentiq.entity.Severity;
import com.incidentiq.service.GeminiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GeminiServiceTest {

    private GeminiService geminiService;

    @BeforeEach
    public void setUp() {
        // Initialize without external API key to test deterministic fallback & heuristics
        geminiService = new GeminiService("");
    }

    @Test
    @DisplayName("Should return default fallback when description is empty")
    public void testEmptyDescriptionFallback() {
        IncidentClassificationDTO result = geminiService.classifyIncident("");
        assertNotNull(result);
        assertEquals(Severity.MEDIUM, result.getSeverity());
        assertEquals("Software", result.getCategory());
        assertFalse(result.getResolutionSteps().isEmpty());
    }

    @Test
    @DisplayName("Should classify network outage as CRITICAL Network incident")
    public void testNetworkIncidentClassification() {
        String desc = "Core datacenter 10GbE network switch offline with 100% packet loss and downtime";
        IncidentClassificationDTO result = geminiService.classifyIncident(desc);

        assertNotNull(result);
        assertEquals(Severity.CRITICAL, result.getSeverity());
        assertEquals("Network", result.getCategory());
        assertTrue(result.getResolutionSteps().size() >= 2);
    }

    @Test
    @DisplayName("Should classify monitor flicker as Hardware incident")
    public void testHardwareIncidentClassification() {
        String desc = "External Dell 4K monitor screen is flickering black over DisplayPort cable";
        IncidentClassificationDTO result = geminiService.classifyIncident(desc);

        assertNotNull(result);
        assertEquals("Hardware", result.getCategory());
        assertNotNull(result.getSeverity());
        assertFalse(result.getResolutionSteps().isEmpty());
    }

    @Test
    @DisplayName("Should return exact Rule 7 fallback format on failure")
    public void testDefaultFallbackStructure() {
        IncidentClassificationDTO fallback = geminiService.getDefaultFallback();
        assertEquals(Severity.MEDIUM, fallback.getSeverity());
        assertEquals("Software", fallback.getCategory());
        assertEquals(1, fallback.getResolutionSteps().size());
        assertEquals("Manual classification required", fallback.getResolutionSteps().get(0));
    }
}
