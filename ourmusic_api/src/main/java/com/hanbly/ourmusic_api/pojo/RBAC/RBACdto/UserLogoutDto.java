package com.hanbly.ourmusic_api.pojo.RBAC.RBACdto;

import jakarta.validation.constraints.NotBlank;

public class UserLogoutDto {

    private Integer userId;

    @NotBlank(message = "用户名不能为空")
    private String userName;

    private String accessToken;

    private String refreshToken;


    public UserLogoutDto() {
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public @NotBlank(message = "用户名不能为空") String getUserName() {
        return userName;
    }

    public void setUserName(@NotBlank(message = "用户名不能为空") String userName) {
        this.userName = userName;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
