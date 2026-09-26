package com.incidentiq.service;

import com.incidentiq.dto.AuthResponse;
import com.incidentiq.dto.LoginRequest;
import com.incidentiq.dto.RegisterRequest;
import com.incidentiq.dto.UserDTO;
import com.incidentiq.entity.Role;
import com.incidentiq.entity.User;
import com.incidentiq.exception.BadRequestException;
import com.incidentiq.repository.UserRepository;
import com.incidentiq.security.CustomUserDetails;
import com.incidentiq.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("User account is inactive. Please contact your system administrator.");
        }

        String token = jwtUtil.generateToken(userDetails, user.getId(), user.getRole().name(), user.getName());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToDTO(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        User newUser = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.EMPLOYEE)
                .department(request.getDepartment() != null ? request.getDepartment().trim() : "General")
                .isActive(true)
                .build();

        User savedUser = userRepository.save(newUser);
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtUtil.generateToken(userDetails, savedUser.getId(), savedUser.getRole().name(), savedUser.getName());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToDTO(savedUser))
                .build();
    }

    public UserDTO getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BadRequestException("No authenticated user in current session.");
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return mapToDTO(userDetails.getUser());
    }

    public UserDTO mapToDTO(User user) {
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
}
