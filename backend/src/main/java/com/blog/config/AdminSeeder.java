package com.blog.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.blog.entity.UserEntity;
import com.blog.repository.UserRepository;

@Configuration
public class AdminSeeder {

    @Bean
    ApplicationRunner seedAdmin(UserRepository userRepository,
                               PasswordEncoder passwordEncoder,
                               Environment env) {
        return args -> {
            // Read from Spring properties (loaded from .env via spring.config.import)
            String adminUsername = env.getProperty("ADMIN_USERNAME");
            String adminEmail    = env.getProperty("ADMIN_EMAIL");
            String adminPassword = env.getProperty("ADMIN_PASSWORD");

            if (isBlank(adminUsername) || isBlank(adminEmail) || isBlank(adminPassword)) {
                return;
            }

            adminUsername = adminUsername.trim();
            adminEmail = adminEmail.trim();

            boolean exists = userRepository.findByUsername(adminUsername).isPresent()
                    || userRepository.findByEmail(adminEmail).isPresent();

            if (exists) return;

            UserEntity admin = new UserEntity();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");

            userRepository.save(admin);
        };
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
