-- ============================================================================
-- IncidentIQ Seed Data (Team Pivot 4 - J.J. College of Engineering & Tech)
-- ============================================================================

-- 1. Insert Categories
INSERT INTO categories (id, name, description, sla_hours) VALUES
(1, 'Network', 'Network infrastructure, VPN, switch, and internet connectivity issues', 4),
(2, 'Hardware', 'Physical workstation, monitor, server component, and peripheral issues', 8),
(3, 'Software', 'Operating systems, productivity suites, and corporate application bugs', 8),
(4, 'Security', 'Access control breaches, credentials, authentication, and security alerts', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), sla_hours=VALUES(sla_hours);

-- 2. Insert Default Users (password is "password123" hashed with BCrypt)
-- Hash: $2a$10$w8/0T6UaCjG7gH.Ym2D9jeOqIqB/sX/1z4fJ6Z9tVv6cQdE4y.P1W
INSERT INTO users (id, name, email, password, role, department, is_active, created_at) VALUES
(1, 'Alex Rivers', 'employee@incidentiq.com', '$2a$10$w8/0T6UaCjG7gH.Ym2D9jeOqIqB/sX/1z4fJ6Z9tVv6cQdE4y.P1W', 'EMPLOYEE', 'IT Department', true, NOW()),
(2, 'Marcus Vance', 'staff@incidentiq.com', '$2a$10$w8/0T6UaCjG7gH.Ym2D9jeOqIqB/sX/1z4fJ6Z9tVv6cQdE4y.P1W', 'IT_STAFF', 'Network Team', true, NOW()),
(3, 'Elena Rostova', 'admin@incidentiq.com', '$2a$10$w8/0T6UaCjG7gH.Ym2D9jeOqIqB/sX/1z4fJ6Z9tVv6cQdE4y.P1W', 'ADMIN', 'Management', true, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), department=VALUES(department);

-- 3. Insert Sample Tickets across all Severities
INSERT INTO tickets (id, title, description, severity, status, category_id, raised_by, assigned_to, ai_resolution, created_at, updated_at, resolved_at, sla_deadline, sla_breached) VALUES
(1, 'Core Data Center Network Switch Offline', 
 'The primary 10GbE network core switch in DC-1 rack B3 has experienced an unexpected hardware power failure causing severe packet loss and outage across regional office services.', 
 'CRITICAL', 'OPEN', 1, 1, 2, 
 '["Inspect redundant power supplies and PDU feed lines.", "Connect via serial console to diagnose kernel panic or hardware faults.", "Failover gateway routes to backup core switch B4 immediately.", "Replace faulty PSU module or switch unit if unrecoverable."]', 
 NOW() - INTERVAL 20 MINUTE, NOW() - INTERVAL 10 MINUTE, NULL, NOW() + INTERVAL 40 MINUTE, false),

(2, 'Global VPN Gateway Unresponsive for Remote Engineers', 
 'Remote employees and developers are unable to establish IPsec/SSL VPN tunnels. The RADIUS authentication requests time out after 30 seconds.', 
 'HIGH', 'IN_PROGRESS', 1, 1, 2, 
 '["Check IPsec tunnel process status on perimeter firewall.", "Verify RADIUS and Active Directory directory sync services.", "Restart VPN gateway daemon and monitor incoming handshakes.", "Allocate additional buffer connections in cluster."]', 
 NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 15 MINUTE, NULL, NOW() + INTERVAL 3 HOUR, false),

(3, 'Outlook & Teams Desktop Apps Crashing on Windows 11 Update', 
 'Multiple users in the Finance department report Outlook and Microsoft Teams crash immediately upon launch following yesterday cumulative OS security patch.', 
 'MEDIUM', 'OPEN', 3, 1, 2, 
 '["Run Outlook in Safe Mode using outlook.exe /safe.", "Clear corrupt local Teams cache under %appdata%\\\\Microsoft\\\\Teams.", "Roll back or reinstall patch KB5034123 via PowerShell if fault persists.", "Push Office quick repair script across affected host group."]', 
 NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR, NULL, NOW() + INTERVAL 6 HOUR, false),

(4, 'Secondary Dell 4K Monitor Display Flickering via DisplayPort', 
 'Second external monitor intermittently flickers black every 20-30 seconds during intensive spreadsheet work on workstation WS-402.', 
 'LOW', 'RESOLVED', 2, 1, 2, 
 '["Replace DisplayPort cable with certified VESA 1.4 rated cable.", "Update Intel/NVIDIA UHD Graphics display drivers to latest enterprise driver.", "Test display refresh rate set to 60Hz instead of 59.94Hz in display settings."]', 
 NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 1 HOUR, false),

(5, 'Anomalous Database Query Volume & Unauthorized Port Scan', 
 'Intrusion Detection System (IDS) alerted to repeated unauthorized connection attempts on MySQL production port 3306 originating from internal staging IP subnet.', 
 'CRITICAL', 'IN_PROGRESS', 4, 1, 2, 
 '["Immediately isolate source IP subnet via host firewall rule.", "Dump active database connections and inspect slow query audit logs.", "Revoke exposed credentials and rotate DB secret keys.", "Initiate full root cause analysis security review."]', 
 NOW() - INTERVAL 45 MINUTE, NOW() - INTERVAL 10 MINUTE, NULL, NOW() + INTERVAL 15 MINUTE, false)
ON DUPLICATE KEY UPDATE title=VALUES(title), status=VALUES(status);

-- 4. Insert Sample Ticket Comments
INSERT INTO ticket_comments (id, ticket_id, user_id, comment, created_at) VALUES
(1, 1, 1, 'Outage began at approximately 02:00 UTC. Secondary failover did not trigger automatically.', NOW() - INTERVAL 18 MINUTE),
(2, 1, 2, 'Acknowledged. IT Network team is dispatched to data center rack B3 with replacement power modules.', NOW() - INTERVAL 10 MINUTE),
(3, 2, 2, 'Restarted primary RADIUS daemon. Monitoring VPN connection pool utilization now.', NOW() - INTERVAL 15 MINUTE),
(4, 4, 2, 'Replaced DisplayPort cable and updated Dell display drivers. Verified issue resolved with user.', NOW() - INTERVAL 3 HOUR)
ON DUPLICATE KEY UPDATE comment=VALUES(comment);

-- 5. Insert Sample Ticket History
INSERT INTO ticket_history (id, ticket_id, changed_by, old_status, new_status, changed_at) VALUES
(1, 1, 1, NULL, 'OPEN', NOW() - INTERVAL 20 MINUTE),
(2, 2, 1, NULL, 'OPEN', NOW() - INTERVAL 1 HOUR),
(3, 2, 2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL 45 MINUTE),
(4, 4, 1, NULL, 'OPEN', NOW() - INTERVAL 1 DAY),
(5, 4, 2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL 18 HOUR),
(6, 4, 2, 'IN_PROGRESS', 'RESOLVED', NOW() - INTERVAL 3 HOUR),
(7, 5, 1, NULL, 'OPEN', NOW() - INTERVAL 45 MINUTE),
(8, 5, 2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL 30 MINUTE)
ON DUPLICATE KEY UPDATE new_status=VALUES(new_status);
