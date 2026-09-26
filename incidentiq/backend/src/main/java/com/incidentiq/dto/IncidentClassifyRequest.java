package com.incidentiq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentClassifyRequest {

    @NotBlank(message = "Incident description is required")
    @Size(min = 10, message = "Incident description must be at least 10 characters")
    private String description;
}
