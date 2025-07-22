package com.hanbly.ourmusic_api.Utils;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class GenerateValidateCodeUtil {

    public String generateValidateCode(int length){
        return UUID.randomUUID().toString().substring(0, length);
    }

    public String generatePasswordRefreshGenerateCode(int length){
        return UUID.randomUUID().toString().substring(0, length);
    }

    public String generatePasswordRefreshToken(User user, String generateCode, Long expireTime){
        return JwtUtils.createToken(user.getUserId().toString(), generateCode, expireTime);
    }

}
