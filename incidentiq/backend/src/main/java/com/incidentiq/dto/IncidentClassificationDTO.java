package com.incidentiq.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.incidentiq.entity.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentClassificationDTO {

    private Severity severity;

    private String category;

    @JsonProperty("resolution_steps")
    private List<String> resolutionSteps;
}
