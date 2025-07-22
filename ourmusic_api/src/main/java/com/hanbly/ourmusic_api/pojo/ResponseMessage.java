package com.hanbly.ourmusic_api.pojo;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.databind.ObjectMapper;

public class ResponseMessage<T> {

    private Integer code;
    private String message;
    private T data;

    public ResponseMessage(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public ResponseMessage(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public ResponseMessage() {
    }

    public static<T> ResponseMessage<T> success(T data) {
        return new ResponseMessage<T>(HttpStatus.OK.value(), "success", data);
    }

    public static<T> ResponseMessage<T> success(String message, T data) {
        return new ResponseMessage<T>(HttpStatus.OK.value(), message, data);
    }

    public static ResponseMessage<Void> success(String message) {
        return new ResponseMessage<>(HttpStatus.OK.value(), message);
    }

    public static ResponseMessage<Void> success() {
        return new ResponseMessage<>(HttpStatus.OK.value(), "success");
    }

    public static ResponseMessage<String> error(String message) {
        return new ResponseMessage<>(500, message);
    }



    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setDate(T data) {
        this.data = data;
    }

    public String toJson() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
