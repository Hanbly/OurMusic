package com.hanbly.ourmusic_api.pojo.RBAC.RBACdto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public class UserResetPasswordDto {

    @NotBlank(message = "密码不能为空")
    @Length(min = 6, max = 24)
    String newPassword;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    private String token;

    public UserResetPasswordDto() {
    }

    public @NotBlank(message = "密码不能为空") @Length(min = 6, max = 24) String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(@NotBlank(message = "密码不能为空") @Length(min = 6, max = 24) String newPassword) {
        this.newPassword = newPassword;
    }

    public @NotBlank(message = "邮箱不能为空") @Email(message = "邮箱格式不正确") String getEmail() {
        return email;
    }

    public void setEmail(@NotBlank(message = "邮箱不能为空") @Email(message = "邮箱格式不正确") String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}

