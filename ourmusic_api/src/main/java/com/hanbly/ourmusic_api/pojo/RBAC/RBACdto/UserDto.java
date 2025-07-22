package com.hanbly.ourmusic_api.pojo.RBAC.RBACdto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public class UserDto {

    private Integer userId;

    @NotBlank(message = "用户名不能为空")
    private String userName;

    private String userNickName;

    private Integer userAvatarFileId;

    private String userAvatarFileUrl;

    @NotBlank(message = "密码不能为空")
    @Length(min = 6, max = 24)
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String userDescription;

    private Integer userSharedCount;
    private Integer userLikedCount;
    private Integer userCollectedCount;

    public UserDto() {
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
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

    public String getUserAvatarFileUrl() {
        return userAvatarFileUrl;
    }

    public void setUserAvatarFileUrl(String userAvatarFileUrl) {
        this.userAvatarFileUrl = userAvatarFileUrl;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserDescription() {
        return userDescription;
    }

    public void setUserDescription(String userDescription) {
        this.userDescription = userDescription;
    }

    public Integer getUserSharedCount() {
        return userSharedCount;
    }

    public void setUserSharedCount(Integer userSharedCount) {
        this.userSharedCount = userSharedCount;
    }

    public Integer getUserLikedCount() {
        return userLikedCount;
    }

    public void setUserLikedCount(Integer userLikedCount) {
        this.userLikedCount = userLikedCount;
    }

    public Integer getUserCollectedCount() {
        return userCollectedCount;
    }

    public void setUserCollectedCount(Integer userCollectedCount) {
        this.userCollectedCount = userCollectedCount;
    }
}
