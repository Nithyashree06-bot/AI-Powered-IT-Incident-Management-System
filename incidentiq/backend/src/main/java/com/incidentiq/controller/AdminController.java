package com.incidentiq.controller;

import com.incidentiq.dto.*;
import com.incidentiq.entity.Category;
import com.incidentiq.entity.User;
import com.incidentiq.exception.ResourceNotFoundException;
import com.incidentiq.repository.CategoryRepository;
import com.incidentiq.repository.UserRepository;
import com.incidentiq.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration", description = "Endpoints for user management, role assignment, and SLA configuration")
public class AdminController {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;

    public AdminController(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            AuthService authService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.authService = authService;
    }

    @GetMapping("/users")
    @Operation(summary = "List all corporate users", description = "Admin view of all users including employees, IT staff, and administrators")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll().stream()
                .map(authService::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved successfully", users));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user role or status", description = "Allows administrators to promote users to IT_STAFF, change department, or toggle active status")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setRole(request.getRole());
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully", authService.mapToDTO(saved)));
    }

    @GetMapping("/sla")
    @Operation(summary = "Get SLA configuration", description = "Retrieve current category SLA hour settings")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getSlaConfig() {
        List<CategoryDTO> list = categoryRepository.findAll().stream()
                .map(c -> CategoryDTO.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .description(c.getDescription())
                        .slaHours(c.getSlaHours())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("SLA configuration retrieved", list));
    }

    @PutMapping("/sla")
    @Operation(summary = "Update category SLA hours", description = "Updates standard resolution target hours for a specific incident category")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateSlaConfig(@Valid @RequestBody UpdateSlaConfigRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        category.setSlaHours(request.getSlaHours());
        Category saved = categoryRepository.save(category);

        CategoryDTO dto = CategoryDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .slaHours(saved.getSlaHours())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("SLA threshold updated successfully", dto));
    }
}
