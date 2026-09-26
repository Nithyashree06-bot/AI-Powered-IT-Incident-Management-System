package com.incidentiq.repository;

import com.incidentiq.entity.Category;
import com.incidentiq.entity.Severity;
import com.incidentiq.entity.Ticket;
import com.incidentiq.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByRaisedById(Long raisedById);

    List<Ticket> findByAssignedToId(Long assignedToId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findBySeverity(Severity severity);

    List<Ticket> findByCategory(Category category);

    List<Ticket> findBySlaBreachedTrue();

    // Query active tickets that have breached SLA deadline and are not yet marked as breached
    @Query("SELECT t FROM Ticket t WHERE t.status != com.incidentiq.entity.TicketStatus.RESOLVED AND t.status != com.incidentiq.entity.TicketStatus.CLOSED AND t.slaDeadline < :now AND t.slaBreached = false")
    List<Ticket> findActiveBreachedTickets(@Param("now") LocalDateTime now);

    long countByStatus(TicketStatus status);

    long countBySeverity(Severity severity);

    long countBySlaBreachedTrue();
}
