package com.hanbly.ourmusic_api.Security;

import com.hanbly.ourmusic_api.Exception.JwtTokenExpiredException;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoginUnAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        ResponseMessage<Void> responseMessage;

        responseMessage = new ResponseMessage<>(403, "当前用户权限不足");

        response.getWriter().write(responseMessage.toJson());
    }
}
