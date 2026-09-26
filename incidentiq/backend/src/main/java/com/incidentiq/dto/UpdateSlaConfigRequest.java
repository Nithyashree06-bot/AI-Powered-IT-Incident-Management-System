package com.incidentiq.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSlaConfigRequest {
    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "SLA hours is required")
    @Min(value = 1, message = "SLA hours must be at least 1")
    private Integer slaHours;
}
