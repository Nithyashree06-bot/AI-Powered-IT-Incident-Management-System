package com.incidentiq.controller;

import com.incidentiq.dto.*;
import com.incidentiq.entity.Category;
import com.incidentiq.entity.Role;
import com.incidentiq.entity.User;
import com.incidentiq.repository.CategoryRepository;
import com.incidentiq.security.CustomUserDetails;
import com.incidentiq.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Tag(name = "Incident Tickets", description = "Endpoints for ticket creation, status management, filtering, and comment threads")
public class TicketController {

    private final TicketService ticketService;
    private final CategoryRepository categoryRepository;

    public TicketController(TicketService ticketService, CategoryRepository categoryRepository) {
        this.ticketService = ticketService;
        this.categoryRepository = categoryRepository;
    }

    @PostMapping("/tickets")
    @Operation(summary = "Create incident ticket", description = "Submits an incident description, invokes Gemini AI classification, auto-calculates SLA deadline, and auto-assigns to IT staff")
    public ResponseEntity<ApiResponse<TicketDTO>> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        TicketDTO created = ticketService.createTicket(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Incident ticket created successfully", created));
    }

    @GetMapping("/tickets")
    @Operation(summary = "List incident tickets", description = "Retrieve filtered tickets based on status, severity, and category. Employees only view their own tickets.")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) Long categoryId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        List<TicketDTO> tickets = ticketService.getAllTickets(status, severity, categoryId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Tickets retrieved successfully", tickets));
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Get ticket details", description = "Retrieve detailed information for an incident including AI resolution suggestions, comments, and audit history")
    public ResponseEntity<ApiResponse<TicketDetailDTO>> getTicketById(@PathVariable Long id) {
        TicketDetailDTO detail = ticketService.getTicketDetail(id);
        return ResponseEntity.ok(ApiResponse.ok("Ticket details retrieved", detail));
    }

    @PutMapping("/tickets/{id}/status")
    @Operation(summary = "Update ticket status", description = "Update the progress status of a ticket (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED) and record audit log")
    public ResponseEntity<ApiResponse<TicketDTO>> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        TicketDTO updated = ticketService.updateTicketStatus(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Ticket status updated successfully", updated));
    }

    @PostMapping("/tickets/{id}/comments")
    @Operation(summary = "Add comment to ticket", description = "Post a comment or troubleshooting note to the incident ticket thread")
    public ResponseEntity<ApiResponse<TicketCommentDTO>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        TicketCommentDTO comment = ticketService.addComment(id, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Comment added successfully", comment));
    }

    @GetMapping("/categories")
    @Operation(summary = "List categories", description = "Retrieve all IT incident categories and their baseline SLA hours")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategories() {
        List<CategoryDTO> categories = categoryRepository.findAll().stream()
                .map(c -> CategoryDTO.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .description(c.getDescription())
                        .slaHours(c.getSlaHours())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Categories retrieved", categories));
    }
}
