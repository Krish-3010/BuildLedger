package com.krish.buildledger.controller;

import com.krish.buildledger.model.User;
import com.krish.buildledger.util.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTUtil jwtUtil;

    /**
     * Password-based login (accepts username or email in the username field).
     * Returns a JSON object: { "token": "eyJhbG..." }
     */
    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, String>> authenticate(@RequestBody User user) {
        String identifier = user.getUsername();
        if (identifier == null || identifier.isBlank()) {
            identifier = user.getEmail();
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, user.getPassword())
        );

        User authenticatedUser = (User) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(authenticatedUser.getUsername());

        return ResponseEntity.ok(Map.of("token", jwt));
    }
}