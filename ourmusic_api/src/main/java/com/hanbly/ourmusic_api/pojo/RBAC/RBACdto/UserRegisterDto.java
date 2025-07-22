package com.hanbly.ourmusic_api.pojo.RBAC.RBACdto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public class UserRegisterDto {

    private Integer userId;

    @NotBlank(message = "用户名不能为空")
    private String userName;

    private String userNickName;

    @NotBlank(message = "密码不能为空")
    @Length(min = 6, max = 24)
    private String password;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(message = "验证码不能为空")
    @Length(min = 6, max = 6)
    private String validateCode;

    private Integer userAvatarFileId;

    private String token;

    public UserRegisterDto() {
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

    public String getUserNickName() {
        return userNickName;
    }

    public void setUserNickName(String userNickName) {
        this.userNickName = userNickName;
    }

    public @NotBlank(message = "密码不能为空") @Length(min = 6, max = 24) String getPassword() {
        return password;
    }

    public void setPassword(@NotBlank(message = "密码不能为空") @Length(min = 6, max = 24) String password) {
        this.password = password;
    }

    public @NotBlank @Email(message = "邮箱格式不正确") String getEmail() {
        return email;
    }

    public void setEmail(@NotBlank @Email(message = "邮箱格式不正确") String email) {
        this.email = email;
    }

    public @NotBlank @Length(min = 6, max = 6) String getValidateCode() {
        return validateCode;
    }

    public void setValidateCode(@NotBlank @Length(min = 6, max = 6) String validateCode) {
        this.validateCode = validateCode;
    }

    public Integer getUserAvatarFileId() {
        return userAvatarFileId;
    }

    public void setUserAvatarFileId(Integer userAvatarFileId) {
        this.userAvatarFileId = userAvatarFileId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}

