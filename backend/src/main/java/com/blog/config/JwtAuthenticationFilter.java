package com.blog.config;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

import com.blog.entity.UserEntity;
import com.blog.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.JwtException;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);

            // ✅ Validate signature/exp/jti/sub
            if (!jwtService.isTokenValid(token)) {
                throw new JwtException("Invalid token");
            }

            // ✅ subject = userId
            Long userId = jwtService.extractUserId(token);

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserEntity userEntity = userRepository.findById(userId)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

                if (userEntity.getBanned()) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                    Map<String, Object> body = Map.of(
                            "timestamp", LocalDateTime.now().toString(),
                            "status", 403,
                            "error", "Forbidden",
                            "message", "Your account is banned");

                    new ObjectMapper().writeValue(response.getOutputStream(), body);
                    return;
                }

                // ✅ Optional: ensure username claim still matches DB (if claim exists)
                String usernameClaim = jwtService.extractUsername(token);
                if (usernameClaim != null && !usernameClaim.equals(userEntity.getUsername())) {
                    throw new JwtException("Token username mismatch");
                }

                // ✅ Role -> Spring authority (IMPORTANT)
                // Spring's hasRole("ADMIN") expects "ROLE_ADMIN"
                String roleDb = (userEntity.getRole() == null || userEntity.getRole().isBlank())
                        ? "USER"
                        : userEntity.getRole().trim();

                String authority = roleDb.startsWith("ROLE_") ? roleDb : "ROLE_" + roleDb;

                // ✅ Build Spring Security UserDetails for SecurityContext
                var userDetails = User.withUsername(userEntity.getUsername())
                        .password(userEntity.getPassword() == null ? "" : userEntity.getPassword())
                        .authorities(authority)
                        .build();

                var authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

            filterChain.doFilter(request, response);

        } catch (JwtException | UsernameNotFoundException | NumberFormatException ex) {
            System.out.println(ex.getClass());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            Map<String, Object> body = Map.of(
                    "timestamp", LocalDateTime.now().toString(),
                    "status", 401,
                    "error", "Unauthorized",
                    "message", "Invalid token or user no longer exists");

            new ObjectMapper().writeValue(response.getOutputStream(), body);
        }
    }
}
