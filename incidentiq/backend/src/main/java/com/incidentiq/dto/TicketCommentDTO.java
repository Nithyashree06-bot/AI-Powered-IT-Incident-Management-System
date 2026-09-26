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
public class TicketCommentDTO {
    private Long id;
    private Long ticketId;
    private UserDTO user;
    private String comment;
    private LocalDateTime createdAt;
}
