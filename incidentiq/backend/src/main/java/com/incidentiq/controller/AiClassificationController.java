package com.incidentiq.controller;

import com.incidentiq.dto.ApiResponse;
import com.incidentiq.dto.IncidentClassificationDTO;
import com.incidentiq.dto.IncidentClassifyRequest;
import com.incidentiq.service.GeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Incident Classification", description = "Endpoints for Google Gemini AI incident classification and resolution generation")
public class AiClassificationController {

    private final GeminiService geminiService;

    public AiClassificationController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/classify")
    @Operation(
            summary = "Classify incident description",
            description = "Analyzes incident text to determine severity (CRITICAL, HIGH, MEDIUM, LOW), category (Network, Hardware, Software, Security), and step-by-step resolution advice"
    )
    public ResponseEntity<ApiResponse<IncidentClassificationDTO>> classifyIncident(
            @Valid @RequestBody IncidentClassifyRequest request) {
        IncidentClassificationDTO result = geminiService.classifyIncident(request.getDescription());
        return ResponseEntity.ok(ApiResponse.ok("Incident classified successfully", result));
    }
}
