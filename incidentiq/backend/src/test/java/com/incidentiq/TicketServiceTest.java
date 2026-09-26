package com.incidentiq;

import com.incidentiq.dto.CreateTicketRequest;
import com.incidentiq.dto.IncidentClassificationDTO;
import com.incidentiq.dto.TicketDTO;
import com.incidentiq.dto.UpdateTicketStatusRequest;
import com.incidentiq.entity.*;
import com.incidentiq.repository.*;
import com.incidentiq.service.GeminiService;
import com.incidentiq.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class TicketServiceTest {

    private TicketRepository ticketRepository;
    private CategoryRepository categoryRepository;
    private UserRepository userRepository;
    private TicketCommentRepository commentRepository;
    private TicketHistoryRepository historyRepository;
    private GeminiService geminiService;
    private TicketService ticketService;

    private User employeeUser;
    private Category networkCategory;

    @BeforeEach
    public void setUp() {
        ticketRepository = Mockito.mock(TicketRepository.class);
        categoryRepository = Mockito.mock(CategoryRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        commentRepository = Mockito.mock(TicketCommentRepository.class);
        historyRepository = Mockito.mock(TicketHistoryRepository.class);
        geminiService = Mockito.mock(GeminiService.class);

        ticketService = new TicketService(
                ticketRepository,
                categoryRepository,
                userRepository,
                commentRepository,
                historyRepository,
                geminiService
        );

        employeeUser = User.builder()
                .id(1L)
                .name("Alex Rivers")
                .email("employee@incidentiq.com")
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();

        networkCategory = Category.builder()
                .id(1L)
                .name("Network")
                .slaHours(4)
                .build();

        when(categoryRepository.findByNameIgnoreCase("Network")).thenReturn(Optional.of(networkCategory));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(networkCategory));
    }

    @Test
    @DisplayName("Should assign 1-hour SLA deadline for CRITICAL incidents according to Rule 8")
    public void testRule8CriticalSlaCalculation() {
        CreateTicketRequest request = CreateTicketRequest.builder()
                .title("Core switch failure")
                .description("Datacenter switch failure causing 100% packet loss and downtime")
                .build();

        when(geminiService.classifyIncident(any())).thenReturn(
                IncidentClassificationDTO.builder()
                        .severity(Severity.CRITICAL)
                        .category("Network")
                        .resolutionSteps(List.of("Check power", "Failover route"))
                        .build()
        );

        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            t.setId(101L);
            return t;
        });

        TicketDTO result = ticketService.createTicket(request, employeeUser);

        assertNotNull(result);
        assertEquals(Severity.CRITICAL, result.getSeverity());
        assertNotNull(result.getSlaDeadline());

        long hoursDiff = Duration.between(result.getCreatedAt(), result.getSlaDeadline()).toHours();
        assertEquals(1, hoursDiff, "CRITICAL incidents must have a 1-hour SLA deadline");
    }

    @Test
    @DisplayName("Should transition status and update audit trail")
    public void testTicketStatusTransition() {
        LocalDateTime now = LocalDateTime.now();
        Ticket existing = Ticket.builder()
                .id(200L)
                .title("VPN issue")
                .description("VPN timeout for remote users")
                .severity(Severity.HIGH)
                .status(TicketStatus.OPEN)
                .category(networkCategory)
                .raisedBy(employeeUser)
                .createdAt(now)
                .slaDeadline(now.plusHours(4))
                .slaBreached(false)
                .build();

        when(ticketRepository.findById(200L)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateTicketStatusRequest req = UpdateTicketStatusRequest.builder()
                .status(TicketStatus.IN_PROGRESS)
                .notes("Assigned and investigating")
                .build();

        TicketDTO updated = ticketService.updateTicketStatus(200L, req, employeeUser);

        assertEquals(TicketStatus.IN_PROGRESS, updated.getStatus());
        Mockito.verify(historyRepository, Mockito.times(1)).save(any(TicketHistory.class));
    }
}
