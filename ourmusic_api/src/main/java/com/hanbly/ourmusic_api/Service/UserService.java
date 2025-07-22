package com.hanbly.ourmusic_api.Service;


import com.hanbly.ourmusic_api.pojo.RBAC.RBACdto.*;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;

import java.util.concurrent.CompletableFuture;

public interface UserService {

    CompletableFuture<ResponseMessage<String>> sendEmail(String email);

    CompletableFuture<ResponseMessage<String>> sendPasswordRefreshEmail(String email);

    UserLoginDto login(UserLoginDto userLoginDto);

    String logout(UserLogoutDto userLogoutDto);

    UserLoginDto refresh(String refreshToken);

    UserDto register(UserRegisterDto userRegisterDto);

    String refreshPassword(UserResetPasswordDto userResetPasswordDto);

    /**
     * 新增用户
     * @param user
     *
     */
    UserDto addUser(UserDto user);

    /**
     * 通过userId查询用户
     * @param userId
     *
     */
    UserDto getUserByUserId(Integer userId);

    /**
     * 更新用户信息
     * @param user
     *
     */
    UserDto updateUser(UserDto user);

    UserEditDto editUserInfo(UserEditDto userEditDto);

    /**
     * 删除用户
     *
     * @param userId
     */
    void deleteUserByUserId(Integer userId);
}
