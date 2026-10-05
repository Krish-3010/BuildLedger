package com.krish.buildledger.config;

import com.krish.buildledger.model.User;
import com.krish.buildledger.repository.UserRepository;
import com.krish.buildledger.util.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Handles successful Google OAuth2 login.
 */
@Component
public class GoogleSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTUtil jwtUtil;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            Map<String, Object> attrs = oAuth2User.getAttributes();

            String sub   = (String) attrs.get("sub");
            String email = (String) attrs.get("email");

            if (sub == null || email == null) {
                String errorUrl = frontendUrl + "/login?error=" + URLEncoder.encode("Google profile missing sub/email", StandardCharsets.UTF_8);
                getRedirectStrategy().sendRedirect(request, response, errorUrl);
                return;
            }

            String cleanEmail = email.toLowerCase().trim();

            // Upsert: find by Google subject ID first, then by email match
            User user = userRepository.findFirstByGoogleSubject(sub)
                    .orElseGet(() -> userRepository.findFirstByEmail(cleanEmail)
                            .orElseGet(User::new));

            user.setGoogleSubject(sub);
            user.setEmail(cleanEmail);
            user.setAuthProvider("GOOGLE");

            if (user.getUsername() == null || user.getUsername().isBlank()) {
                String baseUsername = cleanEmail.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
                if (userRepository.findFirstByUsername(baseUsername).isPresent()) {
                    baseUsername = baseUsername + "_" + (System.currentTimeMillis() % 10000);
                }
                user.setUsername(baseUsername);
            }

            user.touch();
            userRepository.save(user);

            String token = jwtUtil.generateToken(user.getUsername());
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
            String redirectUrl  = frontendUrl + "/oauth2/callback?token=" + encodedToken;

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "OAuth2 authentication failed";
            String errorUrl = frontendUrl + "/login?error=" + URLEncoder.encode(errorMsg, StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
}