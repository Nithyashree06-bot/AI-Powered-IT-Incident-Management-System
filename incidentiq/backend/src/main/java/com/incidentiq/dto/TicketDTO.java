package com.incidentiq.dto;

import com.incidentiq.entity.Severity;
import com.incidentiq.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDTO {
    private Long id;
    private String title;
    private String description;
    private Severity severity;
    private TicketStatus status;
    private CategoryDTO category;
    private UserDTO raisedBy;
    private UserDTO assignedTo;
    private String aiResolution;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime slaDeadline;
    private Boolean slaBreached;
}
