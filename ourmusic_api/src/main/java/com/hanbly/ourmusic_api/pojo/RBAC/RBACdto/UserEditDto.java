package com.hanbly.ourmusic_api.pojo.RBAC.RBACdto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;

public class UserEditDto {

    @NotNull
    private Integer userId;

    private String userName;

    private String userNickName;

    private Integer userAvatarFileId;

    @Length(min = 6, max = 24)
    private String elderPassword;

    @Length(min = 6, max = 24)
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String userDescription;

    @Length(min = 6, max = 6)
    private String validateCode;

    public UserEditDto() {
    }

    public @NotNull Integer getUserId() {
        return userId;
    }

    public void setUserId(@NotNull Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserNickName() {
        return userNickName;
    }

    public void setUserNickName(String userNickName) {
        this.userNickName = userNickName;
    }

    public Integer getUserAvatarFileId() {
        return userAvatarFileId;
    }

    public void setUserAvatarFileId(Integer userAvatarFileId) {
        this.userAvatarFileId = userAvatarFileId;
    }

    public @Length(min = 6, max = 24) String getElderPassword() {
        return elderPassword;
    }

    public void setElderPassword(@Length(min = 6, max = 24) String elderPassword) {
        this.elderPassword = elderPassword;
    }

    public @Length(min = 6, max = 24) String getPassword() {
        return password;
    }

    public void setPassword(@Length(min = 6, max = 24) String password) {
        this.password = password;
    }

    public @Email(message = "邮箱格式不正确") String getEmail() {
        return email;
    }

    public void setEmail(@Email(message = "邮箱格式不正确") String email) {
        this.email = email;
    }

    public String getUserDescription() {
        return userDescription;
    }

    public void setUserDescription(String userDescription) {
        this.userDescription = userDescription;
    }

    public @Length(min = 6, max = 6) String getValidateCode() {
        return validateCode;
    }

    public void setValidateCode(@Length(min = 6, max = 6) String validateCode) {
        this.validateCode = validateCode;
    }
}
