package com.incidentiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistoryDTO {
    private Long id;
    private Long ticketId;
    private UserDTO changedBy;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime changedAt;
}
