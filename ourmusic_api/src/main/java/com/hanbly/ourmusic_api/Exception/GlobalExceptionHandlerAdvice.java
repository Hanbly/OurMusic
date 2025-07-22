package com.hanbly.ourmusic_api.Exception;

import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandlerAdvice {

    /**
     * 处理所有Spring Security相关的认证失败异常
     * @param e AuthenticationException
     * @return ResponseEntity 包装的响应体，HTTP状态码为 401
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ResponseMessage<Void>> handleAuthenticationException(AuthenticationException e) {
        // 打印日志，确认这个处理器被触发了
        System.err.println("认证失败，由专门的处理器捕获: " + e.getMessage());

        // 构建一个标准的响应体
        ResponseMessage<Void> responseBody = new ResponseMessage<>(401, "用户未登录或凭证无效");

        // 使用 ResponseEntity 明确返回 401 Unauthorized 状态码
        return new ResponseEntity<>(responseBody, HttpStatus.UNAUTHORIZED);
    }

    /**
     * 处理业务校验异常，例如注册时用户名已存在
     * @param e IllegalArgumentException
     * @return ResponseEntity
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // 返回 400 Bad Request 状态码
    public ResponseMessage<Void> handleIllegalArgumentException(IllegalArgumentException e) {
        // 记录日志，方便排查问题
        // log.warn("业务校验失败: {}", e.getMessage());
        System.err.println("业务校验失败: " + e.getMessage());
        return new ResponseMessage<>(400, e.getMessage());
    }

    /**
     * 处理业务校验异常，例如注册时用户名已存在
     * @param e EntityNotFoundException
     * @return ResponseEntity
     */
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // 返回 400 Bad Request 状态码
    public ResponseMessage<Void> handleEntityNotFoundException(EntityNotFoundException e) {
        System.err.println("数据查询失败: " + e.getMessage());
        return new ResponseMessage<>(400, e.getMessage());
    }

    /**
     * 处理 @Valid 注解校验失败的异常
     * @param e MethodArgumentNotValidException
     * @return ResponseEntity
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseMessage<Void> handleValidationExceptions(MethodArgumentNotValidException e) {
        // 从异常中获取第一个校验错误信息
        String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        System.err.println("数据校验失败: " + message);
        return new ResponseMessage<>(400, message);
    }

    /**
     * 处理自定义的 Token 过期异常
     */
    @ExceptionHandler(JwtTokenExpiredException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED) // 返回 401 Unauthorized
    public ResponseMessage<Void> handleJwtTokenExpiredException(JwtTokenExpiredException e) {
        System.err.println("Token 过期: " + e.getMessage());
        if(e.getMessage().contains("reset")){
            return new ResponseMessage<>(401, e.getMessage());
        }
        return new ResponseMessage<>(401, "凭证已过期，请重新登录");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "文件大小超过限制");
        // 你可以从配置文件读取这个限制，或者直接硬编码一个友好的提示
        response.put("message", "您上传的文件太大了！请确保单个文件不超过50MB。");

        // 返回 413 Payload Too Large 状态码
        return new ResponseEntity<>(response, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseMessage<Void> handleAuthorizationDeniedException(AuthorizationDeniedException exc) {
        String message = "权限不足！";
        return new ResponseMessage<>(403, message);
    }

    /**
     * 兜底异常处理，处理所有未被捕获的异常
     * @param e Exception
     * @return ResponseEntity
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR) // 返回 500 Internal Server Error
    public ResponseMessage<Void> handleAllExceptions(Exception e) {
        // 在生产环境中，不应将详细的异常堆栈信息返回给前端
        // log.error("服务器内部发生未知错误: ", e);
        e.printStackTrace(); // 开发阶段打印堆栈
        return new ResponseMessage<>(500, "服务器繁忙，请稍后重试");
    }
}
