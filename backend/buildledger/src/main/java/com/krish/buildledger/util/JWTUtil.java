package com.krish.buildledger.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JWTUtil {

    @Value("${jwt.secret}")
    private String key;

    private SecretKey secKey;
    private final long expirationSeconds = 60 * 60; // 1 hour

    @PostConstruct
    public void init() {
        if (key != null && !key.isBlank()) {
            this.secKey = Keys.hmacShaKeyFor(key.getBytes(StandardCharsets.UTF_8));
        }
    }

    /** Generate a JWT with the username as the subject. */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationSeconds * 1000))
                .signWith(secKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Extract the username (subject) from a token. */
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    /** Validate that the token belongs to the given UserDetails and is not expired. */
    public boolean validateToken(String username, UserDetails userDetails, String token) {
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /** How many seconds until a freshly issued token expires. */
    public long expirationSeconds() {
        return expirationSeconds;
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }
}
