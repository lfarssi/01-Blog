package com.blog.exception;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import jakarta.validation.ConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(BadCredentialsException.class)
        @ResponseStatus(HttpStatus.UNAUTHORIZED)
        public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.UNAUTHORIZED.value(),
                                                "error", "Unauthorized",
                                                "message", "Invalid email or password"));
        }

        // ✅ banned/disabled account -> 403 (so Angular interceptor can logout)
        @ExceptionHandler(DisabledException.class)
        @ResponseStatus(HttpStatus.FORBIDDEN)
        public ResponseEntity<Map<String, Object>> handleDisabled(DisabledException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.FORBIDDEN.value(),
                                                "error", "Forbidden",
                                                "message", "Account is banned"));
        }

        @ExceptionHandler(AccessDeniedException.class)
        @ResponseStatus(HttpStatus.FORBIDDEN)
        public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.FORBIDDEN.value(),
                                                "error", "Forbidden",
                                                "message", ex.getMessage()));
        }

        // ✅ for any other authentication failure (token invalid, etc.)
        @ExceptionHandler(AuthenticationException.class)
        @ResponseStatus(HttpStatus.UNAUTHORIZED)
        public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.UNAUTHORIZED.value(),
                                                "error", "Unauthorized",
                                                "message", ex.getMessage()));
        }

        // ✅ @Valid body validation errors (DTO fields)
        @ExceptionHandler(MethodArgumentNotValidException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
                String errors = ex.getBindingResult().getFieldErrors().stream()
                                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                                .collect(Collectors.joining(", "));

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.BAD_REQUEST.value(),
                                                "error", "Bad Request",
                                                "message", "Validation failed: " + errors));
        }

        @ExceptionHandler(UsernameNotFoundException.class)
        @ResponseStatus(HttpStatus.UNAUTHORIZED)
        public ResponseEntity<Map<String, Object>> handleUsernameNotFound(UsernameNotFoundException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.UNAUTHORIZED.value(),
                                                "error", "Unauthorized",
                                                "message", "Invalid or expired token"));
        }

        // ✅ RequestParam / PathVariable validation (@Validated)
        @ExceptionHandler(ConstraintViolationException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
                String errors = ex.getConstraintViolations().stream()
                                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                                .collect(Collectors.joining(", "));

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.BAD_REQUEST.value(),
                                                "error", "Bad Request",
                                                "message", "Constraint violation: " + errors));
        }

        // ✅ invalid JSON / wrong body type
        @ExceptionHandler(HttpMessageNotReadableException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.BAD_REQUEST.value(),
                                                "error", "Bad Request",
                                                "message", "Invalid JSON or request body"));
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        @ResponseStatus(HttpStatus.NOT_FOUND)
        public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.NOT_FOUND.value(),
                                                "error", "Not Found",
                                                "message", ex.getMessage()));
        }

        @ExceptionHandler(ResourceAlreadyExistsException.class)
        @ResponseStatus(HttpStatus.CONFLICT)
        public ResponseEntity<Map<String, Object>> handleAlreadyExists(ResourceAlreadyExistsException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.CONFLICT.value(),
                                                "error", "Conflict",
                                                "message", ex.getMessage()));
        }

        @ExceptionHandler(Exception.class)
        @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
                System.out.println(ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                                "error", "Internal Server Error",
                                                "message", "Something went wrong on our side, please try again later"));
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {

                String msg = "Invalid data";

                // Try to detect common Postgres message
                String raw = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage()
                                : ex.getMessage();
                if (raw != null) {
                        String lower = raw.toLowerCase();

                        if (lower.contains("value too long") && lower.contains("character varying(255)")) {
                                msg = "Text is too long (max 255 characters).";
                        } else if (lower.contains("duplicate key") || lower.contains("unique constraint")) {
                                msg = "This value already exists.";
                        } else if (lower.contains("not-null") || lower.contains("null value")) {
                                msg = "A required field is missing.";
                        } else if (lower.contains("foreign key")) {
                                msg = "Invalid reference (related record not found).";
                        }
                }

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.BAD_REQUEST.value(),
                                                "error", "Bad Request",
                                                "message", msg));
        }

        // ✅ Media / validation errors (wrong file type, too many files, size, etc.)
        @ExceptionHandler(IllegalArgumentException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.BAD_REQUEST.value(),
                                                "error", "Bad Request",
                                                "message", ex.getMessage()));
        }

}
