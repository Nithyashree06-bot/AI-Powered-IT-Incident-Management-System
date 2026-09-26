package com.incidentiq;

import com.incidentiq.entity.Role;
import com.incidentiq.entity.User;
import com.incidentiq.security.CustomUserDetails;
import com.incidentiq.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

public class AuthIntegrationTest {

    @Test
    @DisplayName("BCrypt strength 12 password hashing validation")
    public void testBCryptPasswordEncoder() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String rawPassword = "password123";
        String encoded = encoder.encode(rawPassword);

        assertTrue(encoder.matches(rawPassword, encoded));
        assertFalse(encoder.matches("wrong_password", encoded));
        assertTrue(encoded.startsWith("$2a$12$") || encoded.startsWith("$2b$12$"));
    }

    @Test
    @DisplayName("JWT generation and claims extraction")
    public void testJwtGenerationAndValidation() {
        JwtUtil jwtUtil = new JwtUtil("very_secure_long_secret_key_incidentiq_pivot_4_team_2024", 3600000);

        User user = User.builder()
                .id(99L)
                .name("Alex Rivers")
                .email("employee@incidentiq.com")
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();

        CustomUserDetails userDetails = new CustomUserDetails(user);

        String token = jwtUtil.generateToken(userDetails, user.getId(), user.getRole().name(), user.getName());
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token, userDetails));
        assertEquals("employee@incidentiq.com", jwtUtil.extractUsername(token));
    }
}
