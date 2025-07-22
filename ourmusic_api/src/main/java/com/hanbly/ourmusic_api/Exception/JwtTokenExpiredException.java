package com.hanbly.ourmusic_api.Exception;

import org.springframework.security.core.AuthenticationException;

public class JwtTokenExpiredException extends AuthenticationException {
    public JwtTokenExpiredException(String msg) {
        super(msg);
    }

    public JwtTokenExpiredException(String msg, Throwable cause) {
        super(msg, cause);
    }
}