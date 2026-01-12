package com.blog.config;

public class GlobalResponse {
    private int status;
    private String message;
    private Object data;

    public GlobalResponse(int status, String message, Object data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

}
