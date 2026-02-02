package com.blog.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
// import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    /**
     * IMPORTANT:
     * - SECRET_KEY must be at least 32 bytes for HS256.
     * - Store it in .env / environment variables (NOT in code).
     */
    @Value("${SECRET_KEY}")
    private String SECRET;

    private static final long EXPIRATION_MS = 1000L * 60 * 60 * 24; // 24h

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    // ─────────────────────────────────────────────
    // ✅ Token Generation (stronger)
    // - sub = userId (stable)
    // - jti = random UUID (token id)
    // - username kept as a claim (optional)
    // ─────────────────────────────────────────────
    public String generateToken(Long userId, String username, String role) {
        String jti = UUID.randomUUID().toString();
        Instant now = Instant.now();

        return Jwts.builder()
                .setId(jti) // ✅ jti
                .setSubject(String.valueOf(userId)) // ✅ sub = userId
                .claim("username", username) // optional but useful
                .claim("role",role)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusMillis(EXPIRATION_MS)))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ─────────────────────────────────────────────
    // ✅ Claims Parsing (single source of truth)
    // Throws JwtException if invalid/expired/bad signature
    // ─────────────────────────────────────────────
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractRole(String token) {
        Object role = extractAllClaims(token).get("role");
        return role == null ? null : role.toString();
    }

    // ─────────────────────────────────────────────
    // ✅ Extractors
    // ─────────────────────────────────────────────
    public String extractUsername(String token) {
        // If you generate using userId subject, username is in claim
        Object claim = extractAllClaims(token).get("username");
        if (claim != null)
            return claim.toString();

        // fallback for old tokens where sub=username
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        // Works only for new tokens where sub=userId
        String sub = extractAllClaims(token).getSubject();
        return Long.valueOf(sub);
    }

    public String extractJti(String token) {
        return extractAllClaims(token).getId();
    }

    public boolean isExpired(String token) {
        Date exp = extractAllClaims(token).getExpiration();
        return exp == null || exp.before(new Date());
    }

    // ─────────────────────────────────────────────
    // ✅ Validation
    // - signature valid
    // - not expired
    // - has sub
    // - has jti
    // - (optional) username claim matches userDetails (if present)
    // NOTE: This does NOT implement revocation storage (DB).
    // For revocation, also verify jti exists and not revoked.
    // ─────────────────────────────────────────────
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);

            String sub = claims.getSubject();
            if (sub == null || sub.isBlank())
                return false;

            String jti = claims.getId();
            if (jti == null || jti.isBlank())
                return false;

            Date exp = claims.getExpiration();
            if (exp == null || exp.before(new Date()))
                return false;

            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // public boolean isTokenValid(String token, UserDetails userDetails) {
    // try {
    // Claims claims = extractAllClaims(token);

    // String sub = claims.getSubject();
    // if (sub == null || sub.isBlank()) return false;

    // String jti = claims.getId();
    // if (jti == null || jti.isBlank()) return false;

    // Date exp = claims.getExpiration();
    // if (exp == null || exp.before(new Date())) return false;

    // // If token has username claim, enforce it matches.
    // Object usernameClaim = claims.get("username");
    // if (usernameClaim != null) {
    // return usernameClaim.toString().equals(userDetails.getUsername());
    // }

    // // Otherwise fallback to old style: sub=username
    // return sub.equals(userDetails.getUsername());

    // } catch (JwtException | IllegalArgumentException e) {
    // return false;
    // }
    // }
}
