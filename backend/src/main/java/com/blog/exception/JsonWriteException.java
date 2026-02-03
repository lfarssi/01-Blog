package com.blog.exception;


public class JsonWriteException extends RuntimeException {

    public JsonWriteException(String message, Throwable cause) {
        super(message, cause);
    }
}
