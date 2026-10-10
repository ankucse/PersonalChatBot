package com.novachat.ai.security;

import com.novachat.ai.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@SuppressWarnings("java:S2143") // io.jsonwebtoken.JwtBuilder requires java.util.Date for issuedAt and expiration
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret:NovachatUnicornSecretKey2026SuperSecureEnterpriseGradeToken384Bits}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:86400000}") // 24 hours default
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @SuppressWarnings("java:S2143") // io.jsonwebtoken.JwtBuilder requires java.util.Date for issuedAt and expiration
    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiryDate = now.plusMillis(jwtExpirationMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole().name());
        claims.put("fullName", user.getFullName());

        return Jwts.builder()
                .subject(user.getUsername())
                .claims(claims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiryDate))
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }
}
