package com.blog.dto;

import org.springframework.http.ResponseEntity;

public record ApiResponse(
        int status,
        String message,
        Object data) {

    public static ResponseEntity<Object> from(int status, String message, Object data) {

        return ResponseEntity.ok(new ApiResponse(status, message, data));
    }

}
