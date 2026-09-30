package com.incidentiq.config;

import com.incidentiq.entity.Category;
import com.incidentiq.entity.Role;
import com.incidentiq.entity.User;
import com.incidentiq.repository.CategoryRepository;
import com.incidentiq.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedUsers();
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            log.info("Seeding initial incident categories into Supabase database...");
            List<Category> categories = List.of(
                    Category.builder()
                            .name("Network")
                            .description("Network switches, VPN, internet connectivity, and routers")
                            .slaHours(4)
                            .build(),
                    Category.builder()
                            .name("Hardware")
                            .description("Physical workstations, monitors, docks, and peripheral equipment")
                            .slaHours(8)
                            .build(),
                    Category.builder()
                            .name("Software")
                            .description("Operating system anomalies, office suites, and corporate tools")
                            .slaHours(8)
                            .build(),
                    Category.builder()
                            .name("Security")
                            .description("Unauthorized access, malicious software alerts, and identity breaches")
                            .slaHours(1)
                            .build()
            );
            categoryRepository.saveAll(categories);
            log.info("Seeded 4 default categories into Supabase.");
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@incidentiq.com")) {
            log.info("Creating default Admin user (Elena Rostova) in Supabase...");
            User admin = User.builder()
                    .name("Elena Rostova")
                    .email("admin@incidentiq.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .department("IT Operations")
                    .isActive(true)
                    .build();
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("staff@incidentiq.com")) {
            log.info("Creating default IT Staff user (Marcus Vance) in Supabase...");
            User staff = User.builder()
                    .name("Marcus Vance")
                    .email("staff@incidentiq.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.IT_STAFF)
                    .department("Network & Systems")
                    .isActive(true)
                    .build();
            userRepository.save(staff);
        }

        if (!userRepository.existsByEmail("employee@incidentiq.com")) {
            log.info("Creating default Employee user (Alex Rivers) in Supabase...");
            User employee = User.builder()
                    .name("Alex Rivers")
                    .email("employee@incidentiq.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.EMPLOYEE)
                    .department("Engineering")
                    .isActive(true)
                    .build();
            userRepository.save(employee);
        }
        log.info("Supabase database seed check complete.");
    }
}
