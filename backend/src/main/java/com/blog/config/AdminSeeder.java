package com.blog.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.blog.entity.UserEntity;
import com.blog.repository.UserRepository;

@Configuration
public class AdminSeeder {

    @Bean
    ApplicationRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminUsername = System.getenv("ADMIN_USERNAME");
            String adminEmail    = System.getenv("ADMIN_EMAIL");
            String adminPassword = System.getenv("ADMIN_PASSWORD");

            // ✅ If env vars are not set, don't seed anything
            if (isBlank(adminUsername) || isBlank(adminEmail) || isBlank(adminPassword)) {
                return;
            }

            boolean exists = userRepository.findByUsername(adminUsername).isPresent()
                    || userRepository.findByEmail(adminEmail).isPresent();

            if (exists) return;

            UserEntity admin = new UserEntity();
            admin.setUsername(adminUsername.trim());
            admin.setEmail(adminEmail.trim());
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");

            userRepository.save(admin);
        };
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
