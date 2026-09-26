package com.incidentiq.controller;

import com.incidentiq.dto.ApiResponse;
import com.incidentiq.dto.AuthResponse;
import com.incidentiq.dto.LoginRequest;
import com.incidentiq.dto.RegisterRequest;
import com.incidentiq.dto.UserDTO;
import com.incidentiq.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication, registration, and session profile")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate using email and password to receive a JWT Bearer token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register new employee", description = "Self-registration for employees with default EMPLOYEE role")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Retrieve profile details of the currently authenticated user")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        UserDTO userDTO = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Current user retrieved", userDTO));
    }
}
