package com.hanbly.ourmusic_api.Controller;

import com.hanbly.ourmusic_api.Service.UserService;
import com.hanbly.ourmusic_api.Utils.RedisClient;
import com.hanbly.ourmusic_api.pojo.RBAC.RBACdto.*;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private RedisClient redisClient;

    @PostMapping("/send-email/{email}")        // URL: localhost:8080/api/user/send-email/{email}  method: POST
    public ResponseMessage<String> sendEmail(@PathVariable String email){
        CompletableFuture<ResponseMessage<String>> completableFuture = userService.sendEmail(email);
        return completableFuture.join();
    }

    @PostMapping("/send-reset-email/{email}")        // URL: localhost:8080/api/user/send-reset-email/{email}  method: POST
    public ResponseMessage<String> sendPasswordRefreshEmail(@PathVariable String email){
        CompletableFuture<ResponseMessage<String>> completableFuture = userService.sendPasswordRefreshEmail(email);
        return completableFuture.join();
    }

    @PostMapping("/login")        // URL: localhost:8080/api/user/login  method: POST
    public ResponseMessage<UserLoginDto> login(@Validated @RequestBody UserLoginDto userLoginDto) {

        UserLoginDto user = userService.login(userLoginDto);
        user.setPassword(null);
        return ResponseMessage.success(user);
    }

    @PostMapping("/refresh")        // URL: localhost:8080/api/user/refresh?request-token={refreshToken}  method: POST
    public ResponseMessage<UserLoginDto> refresh(@RequestParam("request-token") String refreshToken) {
        UserLoginDto user = userService.refresh(refreshToken);
        user.setPassword(null);
        return ResponseMessage.success(user);
    }

    @PostMapping("/logout")        // URL: localhost:8080/api/user/logout  method: POST
    public ResponseMessage<String> logout(@Validated @RequestBody UserLogoutDto userLogoutDto) {
        String message = userService.logout(userLogoutDto);
        return ResponseMessage.success(message, null);
    }

    @PostMapping("/register")        // URL: localhost:8080/api/user/register  method: POST
    public ResponseMessage<UserDto> register(@Validated @RequestBody UserRegisterDto userRegisterDto) {
        UserDto user = userService.register(userRegisterDto);
        user.setPassword(null);
        return ResponseMessage.success(user);
    }

    @PostMapping("/password/refresh")        // URL: localhost:8080/api/user/password/refresh?resetToken=...  method: POST
    public ResponseMessage<String> refreshPassword(@Validated @RequestBody UserResetPasswordDto userResetPasswordDto) {
        String result = userService.refreshPassword(userResetPasswordDto);
        return ResponseMessage.success("重置成功", null);
    }

    // 前端传入数据不能包含userId
    @PreAuthorize(value = "hasRole('admin')")
    @PostMapping        // URL: localhost:8080/api/user  method: POST
    public ResponseMessage<UserDto> addUser(@Validated @RequestBody UserDto user) {
        UserDto newUser = userService.addUser(user);
        newUser.setPassword(null);
        return ResponseMessage.success(newUser);
    }

    @PreAuthorize(value = "hasRole('admin') or hasRole('user')")
    @GetMapping("/{userId}")        // URL: localhost:8080/api/user/{userId}  method: GET
    public ResponseMessage<UserDto> getUser(@PathVariable Integer userId) {
        UserDto user = userService.getUserByUserId(userId);
        user.setPassword(null);
        return ResponseMessage.success(user);
    }

    // 前端传入数据必须包含userId
    @PreAuthorize(value = "hasRole('admin')")
    @PutMapping        // URL: localhost:8080/api/user  method: PUT
    public ResponseMessage<UserDto> updateUser(@Validated @RequestBody UserDto user) {
        UserDto updatedUser = userService.updateUser(user);
        updatedUser.setPassword(null);
        return ResponseMessage.success(updatedUser);
    }

    // 前端传入数据必须包含userId
    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userEditDto.userId")
    @PutMapping("/edit-info")        // URL: localhost:8080/api/user/edit-info  method: PUT
    public ResponseMessage<UserEditDto> editUserInfo(@Validated @RequestBody UserEditDto userEditDto) {
        UserEditDto updatedUser = userService.editUserInfo(userEditDto);
        updatedUser.setPassword(null);
        return ResponseMessage.success(updatedUser);
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userId")
    @DeleteMapping("/{userId}")        // URL: localhost:8080/api/user/{userId}  method: DELETE
    public ResponseMessage<Void> deleteUser(@PathVariable Integer userId) {
        userService.deleteUserByUserId(userId);
        return ResponseMessage.success();
    }

}
