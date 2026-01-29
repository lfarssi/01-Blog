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
            // ✅ Change these
            String adminUsername = "admin";
            String adminEmail = "admin@blog.local";
            String adminPassword = "Admin123!"; // change later

            boolean exists = userRepository.findByUsername(adminUsername).isPresent()
                    || userRepository.findByEmail(adminEmail).isPresent();

            if (exists) return;

            UserEntity admin = new UserEntity();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN"); // match your role format
            // set other required fields here (createdAt, enabled, etc.)

            userRepository.save(admin);

        };
    }
}
