package com.incidentiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffPerformanceDTO {
    private Long staffId;
    private String staffName;
    private String department;
    private long assignedCount;
    private long resolvedCount;
    private double avgResolutionHours;
}
