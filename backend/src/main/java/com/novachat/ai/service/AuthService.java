package com.novachat.ai.service;

import com.novachat.ai.dto.AuthResponse;
import com.novachat.ai.dto.LoginRequest;
import com.novachat.ai.dto.RegisterRequest;
import com.novachat.ai.model.Role;
import com.novachat.ai.model.User;
import com.novachat.ai.repository.UserRepository;
import com.novachat.ai.security.JwtTokenProvider;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final String adminPassword;
    private final String demoPassword;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager,
                       @Value("${app.seed.admin-password}") String adminPassword,
                       @Value("${app.seed.demo-password}") String demoPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.adminPassword = adminPassword;
        this.demoPassword = demoPassword;
    }

    @PostConstruct
    @Transactional
    public void seedInitialUsers() {
        // Enforce strictly only one Admin in system and ensure password sync
        Optional<User> existingAdmin = userRepository.findByUsernameIgnoreCase("admin");
        if (existingAdmin.isPresent()) {
            User admin = existingAdmin.get();
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
            logger.info("⚡ Verified and synchronized Super Admin: admin");
        } else {
            User admin = new User(
                    "admin",
                    "admin@novachat.ai",
                    passwordEncoder.encode(adminPassword),
                    "Chief AI Officer (Super Admin)",
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);
            logger.info("⚡ Seeded single Super Admin: admin");
        }

        Optional<User> existingDemo = userRepository.findByUsernameIgnoreCase("sarah");
        if (existingDemo.isPresent()) {
            User demo = existingDemo.get();
            demo.setPassword(passwordEncoder.encode(demoPassword));
            userRepository.save(demo);
        } else {
            User demoUser = new User(
                    "sarah",
                    "sarah@novachat.ai",
                    passwordEncoder.encode(demoPassword),
                    "Sarah Connor",
                    Role.ROLE_USER
            );
            userRepository.save(demoUser);
            logger.info("⚡ Seeded standard demo user: sarah");
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username '" + request.username() + "' is already taken.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email '" + request.email() + "' is already registered.");
        }

        // STRICT BUSINESS RULE: Only standard users can be registered via API. Super Admin is strictly solitary.
        User newUser = new User(
                request.username().trim().toLowerCase(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                request.fullName() != null && !request.fullName().isBlank() ? request.fullName().trim() : request.username(),
                Role.ROLE_USER
        );

        newUser = userRepository.save(newUser);
        String token = tokenProvider.generateToken(newUser);

        return new AuthResponse(
                token,
                newUser.getUsername(),
                newUser.getEmail(),
                newUser.getFullName(),
                newUser.getRole().name()
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.usernameOrEmail() != null ? request.usernameOrEmail().trim() : "";
        String rawPassword = request.password() != null ? request.password().trim() : "";

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, rawPassword)
            );

            User user = userRepository.findByUsernameIgnoreCase(identifier)
                    .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                    .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

            user.setLastLoginAt(LocalDateTime.now(ZoneId.systemDefault()));
            userRepository.save(user);

            String token = tokenProvider.generateToken(user);

            return new AuthResponse(
                    token,
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name()
            );
        } catch (Exception e) {
            logger.warn("Authentication failed for identifier '{}': {}", identifier, e.getMessage());
            throw new BadCredentialsException("Invalid credentials provided. Please check your username/password.");
        }
    }
}
