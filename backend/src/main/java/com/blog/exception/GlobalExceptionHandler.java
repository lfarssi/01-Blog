package com.blog.exception;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import org.springframework.web.server.ResponseStatusException;



import io.jsonwebtoken.JwtException;
import jakarta.validation.ConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(BadCredentialsException.class)
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
        public ResponseEntity<Map<String, Object>> handleDisabled(DisabledException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.FORBIDDEN.value(),
                                                "error", "Forbidden",
                                                "message", "Account is banned"));
        }

        @ExceptionHandler(BlogUnavailableException.class)
        public ResponseEntity<Map<String, Object>> handleBlogUnavailable(BlogUnavailableException ex) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.NOT_FOUND.value(),
                                                "error", "Not Found",
                                                "message", ex.getMessage()));
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.FORBIDDEN.value(),
                                                "error", "Forbidden",
                                                "message", ex.getMessage()));
        }

        // ✅ token invalid / auth failure
        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.UNAUTHORIZED.value(),
                                                "error", "Unauthorized",
                                                "message", ex.getMessage()));
        }

        // ✅ When JWT contains username that no longer exists
        @ExceptionHandler(UsernameNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleUsernameNotFound(UsernameNotFoundException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.UNAUTHORIZED.value(),
                                                "error", "Unauthorized",
                                                "message", "Invalid or expired token"));
        }

        // ✅ @Valid body validation errors (DTO fields)
        @ExceptionHandler(MethodArgumentNotValidException.class)
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

        // ✅ RequestParam / PathVariable validation (@Validated)
        @ExceptionHandler(ConstraintViolationException.class)
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

        // ✅ Bad param type: /blogs/abc (expects Long), ?page=xxx, etc.
        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.BAD_REQUEST.value(),
                                                "error", "Bad Request",
                                                "message", "Invalid parameter: " + ex.getName()));
        }

        // ✅ invalid JSON / wrong body type
        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.BAD_REQUEST.value(),
                                                "error", "Bad Request",
                                                "message", "Invalid JSON or request body"));
        }

        @ExceptionHandler(JsonWriteException.class)
        public ResponseEntity<Map<String, Object>> handleJsonWrite(JsonWriteException ex) {

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                                "error", "Internal Server Error",
                                                "message", "JSON serialization failed"));
        }

        // ✅ invalid multipart/form-data request
        @ExceptionHandler(MultipartException.class)
        public ResponseEntity<Map<String, Object>> handleMultipart(MultipartException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.BAD_REQUEST.value(),
                                                "error", "Bad Request",
                                                "message", "Invalid multipart/form-data request"));
        }

        // ✅ Any JWT parsing error (SignatureException, ExpiredJwtException,
        // MalformedJwtException, etc.)
        @ExceptionHandler(JwtException.class)
        public ResponseEntity<Map<String, Object>> handleJwtException(JwtException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.UNAUTHORIZED.value(),
                                                "error", "Unauthorized",
                                                "message", "Invalid or expired token"));
        }

        // ✅ file too large (can happen before your validator)
        @ExceptionHandler(MaxUploadSizeExceededException.class)
        public ResponseEntity<Map<String, Object>> handleMaxUpload(MaxUploadSizeExceededException ex) {
                return ResponseEntity.status(413)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", 413,
                                                "error", "Request Entity Too Large",
                                                "message", "One of the uploaded files is too large"));
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.NOT_FOUND.value(),
                                                "error", "Not Found",
                                                "message", ex.getMessage()));
        }

        @ExceptionHandler(ResourceAlreadyExistsException.class)
        public ResponseEntity<Map<String, Object>> handleAlreadyExists(ResourceAlreadyExistsException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.CONFLICT.value(),
                                                "error", "Conflict",
                                                "message", ex.getMessage()));
        }

        // ✅ ResponseStatusException (ex: 400 BAD_REQUEST "Cannot moderate your own
        // account")
        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
                return ResponseEntity.status(ex.getStatusCode())
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", ex.getStatusCode().value(),
                                                "error", ex.getStatusCode().toString(),
                                                "message", ex.getReason()));
        }

        // ✅ DB constraints: value too long, unique, FK, etc.
        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {

                String msg = "Invalid data";

                String raw = ex.getMostSpecificCause() != null
                                ? ex.getMostSpecificCause().getMessage()
                                : ex.getMessage();

                if (raw != null) {
                        String lower = raw.toLowerCase();

                        if (lower.contains("value too long") && lower.contains("character varying(10000)")
                                        || lower.contains("character varying")) {
                                msg = "Text is too long (max 10000 characters).";
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

        // ✅ Media / validation errors (wrong file type, too many files, bad magic
        // bytes...)
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.BAD_REQUEST.value(),
                                                "error", "Bad Request",
                                                "message", ex.getMessage()));
        }

        // ✅ ALWAYS LAST
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
                System.out.println(ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of(
                                                "timestamp", LocalDateTime.now().toString(),
                                                "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                                "error", "Internal Server Error",
                                                "message", "Something went wrong on our side, please try again later"));
        }
}
