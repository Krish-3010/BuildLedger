package com.krish.buildledger.service;

import com.krish.buildledger.model.User;
import com.krish.buildledger.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Find user by username or email.
     */
    public User findUser(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new UsernameNotFoundException("Username or email is required");
        }
        String cleanIdentifier = identifier.trim();
        return userRepository.findFirstByUsernameOrEmail(cleanIdentifier, cleanIdentifier.toLowerCase())
                .orElseGet(() -> userRepository.findFirstByUsername(cleanIdentifier)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier)));
    }

    public User createUser(User user) {
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().toLowerCase().trim());
        }
        return userRepository.save(user);
    }
}