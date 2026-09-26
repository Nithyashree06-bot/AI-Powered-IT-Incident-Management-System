package com.incidentiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incidentiq.dto.*;
import com.incidentiq.entity.*;
import com.incidentiq.exception.BadRequestException;
import com.incidentiq.exception.ResourceNotFoundException;
import com.incidentiq.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketHistoryRepository historyRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public TicketService(
            TicketRepository ticketRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            TicketCommentRepository commentRepository,
            TicketHistoryRepository historyRepository,
            GeminiService geminiService) {
        this.ticketRepository = ticketRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.historyRepository = historyRepository;
        this.geminiService = geminiService;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public TicketDTO createTicket(CreateTicketRequest request, User raisedByUser) {
        if (request.getDescription() == null || request.getDescription().trim().length() < 20) {
            throw new BadRequestException("Incident description must be at least 20 characters.");
        }

        // 1. Invoke Gemini AI to classify incident
        IncidentClassificationDTO aiResult = geminiService.classifyIncident(request.getDescription());
        Severity severity = aiResult.getSeverity();

        // 2. Resolve Category (use explicit categoryId if specified, otherwise AI predicted category)
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElse(null);
        }
        if (category == null && aiResult.getCategory() != null) {
            category = categoryRepository.findByNameIgnoreCase(aiResult.getCategory()).orElse(null);
        }
        if (category == null) {
            category = categoryRepository.findByName("Software")
                    .orElseGet(() -> categoryRepository.findAll().stream().findFirst().orElse(null));
        }

        // 3. Auto-calculate SLA Deadline according to Rule 8
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime slaDeadline;
        switch (severity) {
            case CRITICAL -> slaDeadline = now.plusHours(1);
            case HIGH -> slaDeadline = now.plusHours(4);
            case MEDIUM -> slaDeadline = now.plusHours(8);
            case LOW -> slaDeadline = now.plusHours(24);
            default -> slaDeadline = now.plusHours(8);
        }

        // 4. Auto-assignment engine: find suitable IT_STAFF member
        List<User> itStaffMembers = userRepository.findByRoleAndIsActiveTrue(Role.IT_STAFF);
        User assignedStaff = null;
        if (!itStaffMembers.isEmpty()) {
            // Assign to IT staff matching category or pick first available
            assignedStaff = itStaffMembers.stream()
                    .filter(staff -> staff.getDepartment() != null &&
                            category != null &&
                            staff.getDepartment().toLowerCase().contains(category.getName().toLowerCase()))
                    .findFirst()
                    .orElse(itStaffMembers.get(0));
        }

        // Convert AI steps to JSON string
        String aiResolutionJson;
        try {
            aiResolutionJson = objectMapper.writeValueAsString(aiResult.getResolutionSteps());
        } catch (Exception e) {
            aiResolutionJson = "[\"Investigate root cause and apply patch\"]";
        }

        Ticket ticket = Ticket.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .severity(severity)
                .status(TicketStatus.OPEN)
                .category(category)
                .raisedBy(raisedByUser)
                .assignedTo(assignedStaff)
                .aiResolution(aiResolutionJson)
                .createdAt(now)
                .updatedAt(now)
                .slaDeadline(slaDeadline)
                .slaBreached(false)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);

        // 5. Record initial TicketHistory
        TicketHistory initialHistory = TicketHistory.builder()
                .ticket(savedTicket)
                .changedBy(raisedByUser)
                .oldStatus(null)
                .newStatus("OPEN")
                .changedAt(now)
                .build();
        historyRepository.save(initialHistory);

        log.info("Ticket #{} created successfully. Severity={}, SLA Deadline={}",
                savedTicket.getId(), savedTicket.getSeverity(), savedTicket.getSlaDeadline());

        return mapToDTO(savedTicket);
    }

    public List<TicketDTO> getAllTickets(String status, String severity, Long categoryId, User currentUser) {
        List<Ticket> tickets;

        // If employee, only show tickets raised by them
        if (currentUser.getRole() == Role.EMPLOYEE) {
            tickets = ticketRepository.findByRaisedById(currentUser.getId());
        } else {
            tickets = ticketRepository.findAll();
        }

        return tickets.stream()
                .filter(t -> status == null || status.equalsIgnoreCase("ALL") || t.getStatus().name().equalsIgnoreCase(status))
                .filter(t -> severity == null || severity.equalsIgnoreCase("ALL") || t.getSeverity().name().equalsIgnoreCase(severity))
                .filter(t -> categoryId == null || (t.getCategory() != null && t.getCategory().getId().equals(categoryId)))
                .sorted((a, b) -> {
                    // Sort: CRITICAL first, then by createdAt desc
                    if (a.getSeverity() != b.getSeverity()) {
                        return Integer.compare(a.getSeverity().ordinal(), b.getSeverity().ordinal());
                    }
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TicketDetailDTO getTicketDetail(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        List<TicketCommentDTO> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(id)
                .stream()
                .map(this::mapCommentToDTO)
                .collect(Collectors.toList());

        List<TicketHistoryDTO> history = historyRepository.findByTicketIdOrderByChangedAtAsc(id)
                .stream()
                .map(this::mapHistoryToDTO)
                .collect(Collectors.toList());

        return TicketDetailDTO.builder()
                .ticket(mapToDTO(ticket))
                .comments(comments)
                .history(history)
                .build();
    }

    @Transactional
    public TicketDTO updateTicketStatus(Long id, UpdateTicketStatusRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus newStatus = request.getStatus();

        if (oldStatus == newStatus) {
            return mapToDTO(ticket);
        }

        LocalDateTime now = LocalDateTime.now();
        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(now);

        // When moving to RESOLVED, record resolution timestamp and check SLA breach
        if (newStatus == TicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(now);
            if (now.isAfter(ticket.getSlaDeadline())) {
                ticket.setSlaBreached(true);
            }
        }

        // Record in history audit log
        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .changedBy(currentUser)
                .oldStatus(oldStatus.name())
                .newStatus(newStatus.name())
                .changedAt(now)
                .build();
        historyRepository.save(history);

        // If notes were provided, record as comment
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            TicketComment comment = TicketComment.builder()
                    .ticket(ticket)
                    .user(currentUser)
                    .comment("Status changed from " + oldStatus + " to " + newStatus + ": " + request.getNotes().trim())
                    .createdAt(now)
                    .build();
            commentRepository.save(comment);
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToDTO(updatedTicket);
    }

    @Transactional
    public TicketCommentDTO addComment(Long ticketId, CreateCommentRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .user(currentUser)
                .comment(request.getComment().trim())
                .createdAt(LocalDateTime.now())
                .build();

        TicketComment saved = commentRepository.save(comment);
        return mapCommentToDTO(saved);
    }

    // SLA breach check scheduler - runs every 5 minutes
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkSlaBreaches() {
        LocalDateTime now = LocalDateTime.now();
        List<Ticket> breached = ticketRepository.findActiveBreachedTickets(now);
        for (Ticket ticket : breached) {
            ticket.setSlaBreached(true);
            ticketRepository.save(ticket);
            log.warn("SLA Breached for Ticket #{} ('{}'). Deadline was {}",
                    ticket.getId(), ticket.getTitle(), ticket.getSlaDeadline());
        }
    }

    public TicketDTO mapToDTO(Ticket ticket) {
        return TicketDTO.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .severity(ticket.getSeverity())
                .status(ticket.getStatus())
                .category(ticket.getCategory() != null ? CategoryDTO.builder()
                        .id(ticket.getCategory().getId())
                        .name(ticket.getCategory().getName())
                        .description(ticket.getCategory().getDescription())
                        .slaHours(ticket.getCategory().getSlaHours())
                        .build() : null)
                .raisedBy(mapUserToDTO(ticket.getRaisedBy()))
                .assignedTo(ticket.getAssignedTo() != null ? mapUserToDTO(ticket.getAssignedTo()) : null)
                .aiResolution(ticket.getAiResolution())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .slaDeadline(ticket.getSlaDeadline())
                .slaBreached(ticket.getSlaBreached())
                .build();
    }

    public UserDTO mapUserToDTO(User user) {
        if (user == null) return null;
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public TicketCommentDTO mapCommentToDTO(TicketComment comment) {
        return TicketCommentDTO.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .user(mapUserToDTO(comment.getUser()))
                .comment(comment.getComment())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public TicketHistoryDTO mapHistoryToDTO(TicketHistory history) {
        return TicketHistoryDTO.builder()
                .id(history.getId())
                .ticketId(history.getTicket().getId())
                .changedBy(mapUserToDTO(history.getChangedBy()))
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .changedAt(history.getChangedAt())
                .build();
    }
}
