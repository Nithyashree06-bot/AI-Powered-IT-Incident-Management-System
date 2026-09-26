package com.incidentiq.controller;

import com.incidentiq.dto.AnalyticsSummaryDTO;
import com.incidentiq.dto.ApiResponse;
import com.incidentiq.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics & Reports", description = "Endpoints for SLA tracking, compliance metrics, and incident distribution")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'IT_STAFF')")
    @Operation(summary = "Get analytics dashboard summary", description = "Provides SLA compliance rate, resolution velocity, MTTR, category breakdowns, and resolution trends")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDTO>> getAnalyticsSummary() {
        AnalyticsSummaryDTO summary = analyticsService.getSummary();
        return ResponseEntity.ok(ApiResponse.ok("Analytics summary retrieved", summary));
    }
}
