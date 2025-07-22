package com.hanbly.ourmusic_api.pojo.RBAC.RBACdto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

import java.util.List;

public class UserLoginDto {

    private Integer userId;

    private String userImageFileUrl;

    private List<String> userRoles;

    @NotBlank(message = "用户名不能为空")
    private String userName;

    @NotBlank(message = "密码不能为空")
    @Length(min = 6, max = 24)
    private String password;

    private String accessToken;

    private String refreshToken;

    public UserLoginDto() {
    }

    public UserLoginDto(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserImageFileUrl() {
        return userImageFileUrl;
    }

    public void setUserImageFileUrl(String userImageFileUrl) {
        this.userImageFileUrl = userImageFileUrl;
    }

    public List<String> getUserRoles() {
        return userRoles;
    }

    public void setUserRoles(List<String> userRoles) {
        this.userRoles = userRoles;
    }

    public @NotBlank(message = "用户名不能为空") String getUserName() {
        return userName;
    }

    public void setUserName(@NotBlank(message = "用户名不能为空") String userName) {
        this.userName = userName;
    }

    public @NotBlank(message = "密码不能为空") @Length(min = 6, max = 24) String getPassword() {
        return password;
    }

    public void setPassword(@NotBlank(message = "密码不能为空") @Length(min = 6, max = 24) String password) {
        this.password = password;
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
