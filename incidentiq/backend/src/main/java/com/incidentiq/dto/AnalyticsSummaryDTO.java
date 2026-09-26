package com.incidentiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDTO {
    private long totalTickets;
    private long openCount;
    private long inProgressCount;
    private long resolvedCount;
    private long closedCount;
    private long breachedCount;
    private double slaComplianceRate; // percentage e.g. 92.5
    private double averageResolutionHours; // MTTR
    private Map<String, Long> ticketsBySeverity;
    private Map<String, Long> ticketsByCategory;
    private List<DailyTrendDTO> resolutionTrends;
    private List<StaffPerformanceDTO> staffPerformance;
}
