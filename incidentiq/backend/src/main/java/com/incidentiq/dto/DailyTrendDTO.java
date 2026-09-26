package com.incidentiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTrendDTO {
    private String date;
    private long totalTickets;
    private long resolvedTickets;
    private double avgResolutionHours;
}
