package com.hanbly.ourmusic_api.Service.ServiceImpl;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hanbly.ourmusic_api.Dao.DataStats.CollectStatsDao;
import com.hanbly.ourmusic_api.Dao.DataStats.LikeDao;
import com.hanbly.ourmusic_api.Dao.DataStats.UploadShareDao;
import com.hanbly.ourmusic_api.Dao.FileDao;
import com.hanbly.ourmusic_api.Dao.RoleDao;
import com.hanbly.ourmusic_api.Dao.UserDao;
import com.hanbly.ourmusic_api.Exception.JwtTokenExpiredException;
import com.hanbly.ourmusic_api.Security.pojo.CustomUserDetails;
import com.hanbly.ourmusic_api.Service.UserService;
import com.hanbly.ourmusic_api.Utils.GenerateValidateCodeUtil;
import com.hanbly.ourmusic_api.Utils.RedisClient;
import com.hanbly.ourmusic_api.Utils.JwtUtils;
import com.hanbly.ourmusic_api.pojo.CustomFile;
import com.hanbly.ourmusic_api.pojo.DataStats.UploadShare;
import com.hanbly.ourmusic_api.pojo.RBAC.RBACdto.*;
import com.hanbly.ourmusic_api.pojo.RBAC.Role;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import com.hanbly.ourmusic_api.pojo.dto.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Field;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserDao userDao;
    @Autowired
    private FileDao fileDao;
    @Autowired
    private MusicCollectionServiceImpl musicCollectionServiceImpl;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RedisClient redisClient;
    @Autowired
    private RoleDao roleDao;
    @Autowired
    private LikeDao likeDao;
    @Autowired
    private UploadShareDao uploadShareDao;
    @Autowired
    private CollectStatsDao collectStatsDao;
    @Autowired
    private GenerateValidateCodeUtil generateValidateCodeUtil;

    private final static Long REFRESH_TOKEN_EXPIRE = 3*24*60*60*1000L; // 3天
    private final static Long API_TOKEN_EXPIRE = 6 * 60 * 60 * 1000L; // 6小时
//    private final static Long REFRESH_TOKEN_EXPIRE = 6 * 1000L;
//    private final static Long API_TOKEN_EXPIRE = 6 * 1000L;

    private final static Long EMAIL_VALIDATE_EXPIRE = 10 * 60 * 1000L; // 10分钟
    private final static Long RESET_PASSWORD_EXPIRE = 10 * 60 * 1000L;
    private final static Integer VALIDATE_CODE_LENGTH = 6;
    private final static Integer RESET_PASSWORD_CODE = 11;

    @Autowired
    private JavaMailSenderImpl mailSender;
    @Value("${spring.mail.username}")
    private String username ;

    /**
     * 将Authentication对象转换为UserLoginDto
     * @param userDetails 用户数据
     * @return 填充好数据的UserLoginDto
     */
    private UserLoginDto convertAuthToDto(CustomUserDetails userDetails, String accessToken, String refreshToken) {
        UserLoginDto dto = new UserLoginDto();
        dto.setUserId(userDetails.getUserId());
        dto.setUserImageFileUrl(userDetails.getUserImageFileUrl());
        dto.setUserName(userDetails.getUsername());
        dto.setUserRoles(userDetails.getUserRoles());
        dto.setAccessToken(accessToken);
        dto.setRefreshToken(refreshToken);
        dto.setPassword(null); // 安全起见，密码不返回
        return dto;
    }

    @Override
    @Async
    public CompletableFuture<ResponseMessage<String>> sendEmail(String email) {
//        if(!userDao.existsByEmail(email)) {
//            return CompletableFuture.completedFuture(ResponseMessage.error("邮箱不存在"));
//        }
        String validateCode = generateValidateCodeUtil.generateValidateCode(VALIDATE_CODE_LENGTH);
        String message = "您的注册验证码为：" + validateCode + " 请在 " + EMAIL_VALIDATE_EXPIRE/60/1000 + " 分钟内使用。";

        try{
            SimpleMailMessage emailMessage = new SimpleMailMessage();
            emailMessage.setFrom(username);
            emailMessage.setTo(email);
            emailMessage.setSubject("OurMusic 注册验证码");
            emailMessage.setText(message);
            mailSender.send(emailMessage);
            redisClient.set(email, validateCode, EMAIL_VALIDATE_EXPIRE);
        }catch (Exception e){
            System.err.println(e.getMessage());
            return CompletableFuture.completedFuture(ResponseMessage.error("验证码发送失败"));
        }

        return CompletableFuture.completedFuture(ResponseMessage.success("已发送验证码", null));
    }

    @Override
    public CompletableFuture<ResponseMessage<String>> sendPasswordRefreshEmail(String email) {
        if(!userDao.existsByEmail(email)) {
            return CompletableFuture.completedFuture(ResponseMessage.error("邮箱不存在"));
        }
        User user = userDao.findByEmail(email);
        if(user == null) {
            throw new EntityNotFoundException("无对应用户");
        }
        String generateCode = generateValidateCodeUtil.generatePasswordRefreshGenerateCode(11);
        String token = generateValidateCodeUtil.generatePasswordRefreshToken(user, generateCode, RESET_PASSWORD_EXPIRE);
        String url = "http://localhost:3000/reset-password/" + token;
        String message = "您的重置链接为：" + url + " 请在 " + RESET_PASSWORD_EXPIRE/60/1000 + " 分钟内使用。";

        try{
            SimpleMailMessage emailMessage = new SimpleMailMessage();
            emailMessage.setFrom(username);
            emailMessage.setTo(email);
            emailMessage.setSubject("OurMusic 重置密码");
            emailMessage.setText(message);
            mailSender.send(emailMessage);
            redisClient.set("reset_password_" + user.getUserId(), token, RESET_PASSWORD_EXPIRE);
            redisClient.set("reset_generate_code_" + user.getUserId(), generateCode, RESET_PASSWORD_EXPIRE);
        }catch (Exception e){
            System.err.println(e.getMessage());
            return CompletableFuture.completedFuture(ResponseMessage.error("验证链接发送失败"));
        }

        return CompletableFuture.completedFuture(ResponseMessage.success("已发送验证链接", null));
    }

    @Override
    public UserLoginDto login(UserLoginDto userLoginDto) {

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userLoginDto.getUserName(), userLoginDto.getPassword());
        /**
         * Authentication:
         * 如果成功，拿到数据库中用户的所有信息
         */
        Authentication authentication = authenticationManager.authenticate(authToken);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String accessToken = JwtUtils.createToken(userDetails.getUserId().toString(), userDetails.getUsername(), API_TOKEN_EXPIRE);
        String refreshToken = JwtUtils.createToken(userDetails.getUserId().toString(), userDetails.getUsername(), REFRESH_TOKEN_EXPIRE);

        redisClient.set("refresh_token_" + userDetails.getUsername(), refreshToken, REFRESH_TOKEN_EXPIRE);

        return convertAuthToDto(userDetails, accessToken, refreshToken);
    }

    @Override
    public String logout(UserLogoutDto userLogoutDto) {
        String redisKey = "refresh_token_" + userLogoutDto.getUserName();

        if (redisClient.exists(redisKey)) {
            redisClient.delete(redisKey);
            return "成功退出登录";
        } else {
            // 即使Redis中已经没有了（可能因为过期等原因），也应该告知前端操作成功。
            return "已退出登录（无已有状态）";
        }
    }

    @Override
    public UserLoginDto refresh(String refreshToken) {
        try{
            String token = refreshToken.substring(7);
            DecodedJWT decodedJWT = JwtUtils.verifyToken(token);
            if(decodedJWT != null) {
                String username = decodedJWT.getClaim("username").asString();
                String savedToken = redisClient.get("refresh_token_" + username);
                if (savedToken != null && savedToken.equals(token)) { // 验证redis中token与当前请求的refresh token完全相同
                    String userId = decodedJWT.getClaim("userId").asString();
                    System.out.println(userId);

                    String newAccessToken = JwtUtils.createToken(userId, username, API_TOKEN_EXPIRE);
//                    String newRefreshToken = JwtUtils.createToken(userId, username, REFRESH_TOKEN_EXPIRE);
//                    redisClient.set("refresh_token_" + username, newRefreshToken, REFRESH_TOKEN_EXPIRE);
                    System.out.println(newAccessToken);
//                    System.out.println(newRefreshToken);
                    return new UserLoginDto(
                            newAccessToken,
                            token
//                            newRefreshToken
                    );
                }
            }
        } catch (JWTVerificationException e) {
            throw new JwtTokenExpiredException("refresh token无效或过期，请重新登录");
        }

        return null;
    }

    @Override
    public UserDto register(UserRegisterDto userRegisterDto) {
        if (userRegisterDto == null ) {
            throw new IllegalArgumentException("用户名、邮箱和密码不能为空");
        }

        if (userDao.existsByUserName(userRegisterDto.getUserName())) {
            throw new IllegalArgumentException("该用户名已被占用");
        }
        if (userDao.existsByEmail(userRegisterDto.getEmail())) {
            throw new IllegalArgumentException("该邮箱已被占用");
        }
        if (!Objects.equals(redisClient.get(userRegisterDto.getEmail()), userRegisterDto.getValidateCode())){
            throw new IllegalArgumentException("邮箱验证码不正确");
        }

        redisClient.delete(userRegisterDto.getEmail());

        User user = new User();
        UserDto userDto = new UserDto();

        String username = userRegisterDto.getUserName();
        String email = userRegisterDto.getEmail();
        String password = passwordEncoder.encode(userRegisterDto.getPassword());

        user.setUserName(username);
        user.setEmail(email);

        userDto.setUserName(username);
        userDto.setEmail(email);

        user.setPassword(password);
        userDto.setPassword(password);

        if(userRegisterDto.getUserAvatarFileId() != null){
            CustomFile file = fileDao.findById( userRegisterDto.getUserAvatarFileId() ).orElseThrow(() -> new EntityNotFoundException("无法查询文件"));
            file.setFileStatus(CustomFile.FileStatus.ACTIVE);
            user.setUserAvatarFile(file);

            userDto.setUserAvatarFileId(file.getCustomFileId());
            userDto.setUserAvatarFileUrl(file.getFileUrl());
        }
        // 如果有其他信息，也在这里设置
        Role userRole = roleDao.findByRoleName("user");
        user.setRoles(Collections.singleton(userRole));

        userDto.setUserSharedCount(0);
        userDto.setUserLikedCount(0);
        userDto.setUserCollectedCount(0); // dto包含需要展示的数据

        userDao.save(user);

        try {
            // 创建历史记录、默认收藏夹
            MusicCollectionDto history = new MusicCollectionDto(
                    "历史记录",
                    null,
                    "查看听歌历史",
                    "不公开",
                    user.getUserId(),
                    new ArrayList<>()
            );
            musicCollectionServiceImpl.addCollection(history);
            MusicCollectionDto defaultCollection = new MusicCollectionDto(
                    "默认歌单",
                    null,
                    "收藏的歌曲默认都在这里",
                    "不公开",
                    user.getUserId(),
                    new ArrayList<>()
            );
            musicCollectionServiceImpl.addCollection(defaultCollection);
            return userDto;
        } catch (DataIntegrityViolationException e) {
            // 捕获可能由数据库层面（比如并发时）产生的唯一约束冲突
            // 这是一个兜底的异常处理
            throw new IllegalArgumentException("无法完成注册，可能用户名或邮箱已被占用。");
        }
    }

    public ResponseMessage<String> resetTokenValidate(String token) {
        try{
            DecodedJWT decodedJWT = JwtUtils.verifyToken(token);
            if(decodedJWT != null) {
                String userId = decodedJWT.getClaim("userId").asString();
                String generateCode = decodedJWT.getClaim("username").asString();
                String savedToken = redisClient.get("reset_password_" + userId);
                String savedGenerateCode = redisClient.get("reset_generate_code_" + userId);
                if (savedToken != null && savedToken.equals(token)) { // 验证redis中token与当前请求的refresh token完全相同
                    if(savedGenerateCode != null && savedGenerateCode.equals(generateCode)) {
//                        redisClient.delete("reset_password_" + userId);
//                        redisClient.delete("reset_generate_code_" + userId);
                        return ResponseMessage.success("验证成功", token);
                    }
                }
            }
        } catch (JWTVerificationException e) {
            throw new JwtTokenExpiredException("reset token无效或过期");
        }
        return ResponseMessage.error("reset token无效或过期");
    }

    @Override
    public String refreshPassword(UserResetPasswordDto userResetPasswordDto) {
        String newPassword = userResetPasswordDto.getNewPassword();
        String email = userResetPasswordDto.getEmail();
        String resetToken = userResetPasswordDto.getToken();
        User user = userDao.findByEmail(email);
        if(newPassword == null || newPassword.isEmpty() || email == null || email.isEmpty()){
            throw new IllegalArgumentException("参数异常，请检查！");
        }
        if(user == null){
            throw new IllegalArgumentException("用户不存在");
        }
        if(resetToken == null || resetToken.isEmpty()){
            throw new IllegalArgumentException("reset token为空");
        }
        ResponseMessage<String> responseMessage = resetTokenValidate(resetToken);
        if(responseMessage.getCode() == 200){
            redisClient.delete("reset_password_" + user.getUserId());
            redisClient.delete("reset_generate_code_" + user.getUserId());
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userDao.save(user);
        return "重置成功";
    }

    @Override
    public UserDto addUser(UserDto user) {
//        if (user == null ) {
//            throw new IllegalArgumentException("用户名、邮箱和密码不能为空");
//        }
//
//        if (userDao.existsByUserName(user.getUserName())) {
//            throw new IllegalArgumentException("该用户名已被占用");
//        }
//        if (userDao.existsByEmail(user.getEmail())) {
//            throw new IllegalArgumentException("该邮箱已被占用");
//        }
//
//        UserDto resultDto = new UserDto();
//        BeanUtils.copyProperties(user, resultDto, "userAvatarFileId", "password", "userSharedCount", "userLikedCount", "userCollectedCount");
//
//        if(user.getUserAvatarFileId() != null){
//            CustomFile file = fileDao.findById( user.getUserAvatarFileId() ).orElseThrow(() -> new EntityNotFoundException("无法查询文件"));
//            file.setFileStatus(CustomFile.FileStatus.ACTIVE);
//
//            resultDto.setUserAvatarFileId(file.getCustomFileId());
//            resultDto.setUserAvatarFileUrl(file.getFileUrl());
//        }
//
//        // 如果有其他信息，也在这里设置
//        userPojo.setUserAvatarFile(file);
//
//        userPojo.setUserSharedCount(0);
//        userPojo.setUserLikedCount(0);
//        userPojo.setUserCollectedCount(0);
//
//        userDao.save(userPojo);
//
//        return userPojo;
        return null;
    }

    @Override
    public UserDto getUserByUserId(Integer userId) {

        User user = userDao.findById(userId).orElseThrow(() -> new IllegalArgumentException("参数异常，用户不存在"));
        UserDto resultDto = new UserDto();
        BeanUtils.copyProperties(user, resultDto,  "password", "userSharedCount", "userLikedCount", "userCollectedCount");
        if(user.getUserAvatarFile() != null){
            CustomFile file = user.getUserAvatarFile();

            resultDto.setUserAvatarFileId(file.getCustomFileId());
            resultDto.setUserAvatarFileUrl(file.getFileUrl());
        }
        Integer likedCount = likeDao.countLikeByUserId(userId);
        Integer uploadShareCount = uploadShareDao.countAllByUploadShareOwnerTypeAndUploadSharedByUser_UserId(UploadShare.OwnerType.MUSIC, userId);

        Integer collectdCount =
                collectStatsDao.countMusicCollectStatsByUserId(userId) +
                        collectStatsDao.countMusicCollectionCollectStatsByUserId(userId);

        resultDto.setUserLikedCount(likedCount);
        resultDto.setUserSharedCount(uploadShareCount);
        resultDto.setUserCollectedCount(collectdCount);
        return resultDto;
    }

    @Override
    public UserDto updateUser(UserDto user) {
//        if (user == null ) {
//            throw new IllegalArgumentException("用户名、邮箱和密码不能为空");
//        }
//
//        if (userDao.existsByUserName(user.getUserName())) {
//            throw new IllegalArgumentException("该用户名已被占用");
//        }
//        if (userDao.existsByEmail(user.getEmail())) {
//            throw new IllegalArgumentException("该邮箱已被占用");
//        }
//
//        User userPojo = new User();
//        UserDto resultDto = new UserDto();
//        BeanUtils.copyProperties(user, resultDto, "userAvatarFileId",  "password", "userSharedCount", "userLikedCount", "userCollectedCount");
//
//
//        if(user.getUserAvatarFileId() != null){
//            CustomFile file = fileDao.findById( user.getUserAvatarFileId() ).orElseThrow(() -> new EntityNotFoundException("无法查询文件"));
//            file.setFileStatus(CustomFile.FileStatus.ACTIVE);
//            userPojo.setUserAvatarFile(file);
//        }
//
//        userDao.save(userPojo);
//
//        return userPojo;
        return null;
    }

    @Override
    public UserEditDto editUserInfo(UserEditDto userEditDto) {
        if (userEditDto == null ) {
            throw new IllegalArgumentException("修改参数不合法，请检查！");
        }
        if (userEditDto.getUserName() != null && userDao.existsByUserName(userEditDto.getUserName())) {
            throw new IllegalArgumentException("该用户名已被占用");
        }
        if (userEditDto.getEmail() != null && userDao.existsByEmail(userEditDto.getEmail())) {
            throw new IllegalArgumentException("该邮箱已被占用");
        }
        if (userEditDto.getEmail() != null && !userEditDto.getValidateCode().equals(redisClient.get(userEditDto.getEmail()))){
            throw new IllegalArgumentException("验证码不正确或不匹配");
        }

        if(userEditDto.getUserId() == null) {
            throw new IllegalArgumentException("修改参数不合法，请检查！");
        }

        User user = userDao.findById(userEditDto.getUserId()).orElseThrow(() -> new EntityNotFoundException("无法编辑该用户"));

        UserEditDto editResultDto = new UserEditDto();

        if(userEditDto.getPassword() != null && userEditDto.getElderPassword() != null) {
            if(userEditDto.getPassword().equals(userEditDto.getElderPassword())) {
                throw new IllegalArgumentException("修改后不能与原密码相同！");
            }
            if(!passwordEncoder.matches(userEditDto.getElderPassword(),user.getPassword())){
                throw new IllegalArgumentException("请检查原密码是否正确！");
            }
            copyNonNullProperties(userEditDto, user);
            user.setPassword(passwordEncoder.encode(userEditDto.getPassword()));
            userDao.save(user);
            BeanUtils.copyProperties(user, editResultDto);
            return editResultDto;
        }
        else if(userEditDto.getPassword() == null && userEditDto.getElderPassword() == null && userEditDto.getUserAvatarFileId() == null){
            copyNonNullProperties(userEditDto, user);
            userDao.save(user);
            BeanUtils.copyProperties(user, editResultDto);
            return editResultDto;
        }
        else if(userEditDto.getUserAvatarFileId() != null){
            copyNonNullProperties(userEditDto, user);
            CustomFile file = fileDao.findById( userEditDto.getUserAvatarFileId() ).orElseThrow(() -> new EntityNotFoundException("无法查询文件"));
            file.setFileStatus(CustomFile.FileStatus.ACTIVE);
            user.setUserAvatarFile(file);
            userDao.save(user);
            BeanUtils.copyProperties(user, editResultDto);
            return editResultDto;
        }

        throw new IllegalArgumentException("修改参数不合法，请检查！");
    }

    @Override
    public void deleteUserByUserId(Integer userId) {
        userDao.deleteById(userId);
    }

//    private void copyNonNullProperties(Object source, Object target) {
//        try {
//            for (Field field : source.getClass().getDeclaredFields()) {
//                field.setAccessible(true);
//                Object value = field.get(source);
//                if (value != null) {
//                    Field targetField = target.getClass().getDeclaredField(field.getName());
//                    targetField.setAccessible(true);
//                    targetField.set(target, value);
//                }
//            }
//        } catch (Exception e) {
//            throw new RuntimeException("复制属性时出错", e);
//        }
//    }
private void copyNonNullProperties(Object source, Object target) {
    try {
        for (Field field : source.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            Object value = field.get(source);
            if (value != null) {
                try {
                    // 尝试在 target 中查找同名字段
                    Field targetField = target.getClass().getDeclaredField(field.getName());
                    targetField.setAccessible(true);
                    targetField.set(target, value);
                } catch (NoSuchFieldException e) {
                    // 如果在 target 中找不到该字段，就忽略它，而不是让程序崩溃
                    // 你可以在这里加一条日志，用于调试
                    // log.warn("Property '{}' not found in target class '{}', skipping.", field.getName(), target.getClass().getSimpleName());
                }
            }
        }
    } catch (Exception e) {
        throw new RuntimeException("复制属性时出错", e);
    }
}

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8"); // 设置内容类型和编码

        // 创建一个 Map 来构建 JSON 对象
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", status);
        errorDetails.put("message", message);
        // 您还可以添加时间戳等其他信息
        // errorDetails.put("timestamp", System.currentTimeMillis());

        // 使用 ObjectMapper 将 Map 转换为 JSON 字符串
        // 注意：您可能需要一个 ObjectMapper 的实例。可以在类中@Autowired一个，或者在这里new一个。
        ObjectMapper mapper = new ObjectMapper();
        String jsonResponse = mapper.writeValueAsString(errorDetails);

        // 写入响应
        PrintWriter writer = response.getWriter();
        writer.write(jsonResponse);
        writer.flush();
    }
}