package com.hanbly.ourmusic_api.Utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.hanbly.ourmusic_api.Dao.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {

    @Autowired
    private UserDao userDao;

    // 秘钥，必须妥善保管，生产环境中不能硬编码！
    private static final String SECRET_KEY = "your-very-secret-key";

    /**
     * 生成JWT Token
     * @param userId 用户ID
     * @param username 用户名
     * @return 生成的JWT Token字符串
     */
    public static String createToken(String userId, String username, Long EXPIRATION_TIME) {
        try {
            // 1. 选择签名算法
            Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);

            // 2. 定义Token的过期时间
            Date expirationDate = new Date(System.currentTimeMillis() + EXPIRATION_TIME);

            // 3. 设置Payload（可以自定义存放的数据）
            String token = JWT.create()
                    .withClaim("userId", userId) // 自定义Claim: 用户ID
                    .withClaim("username", username) // 自定义Claim: 用户名
                    .withIssuer("OurMusicApp") // 签发者
                    .withIssuedAt(new Date()) // 签发时间
                    .withExpiresAt(expirationDate) // 过期时间
                    .sign(algorithm); // 使用算法和秘钥进行签名

            return token;
        } catch (Exception e) {
            // 处理异常
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 验证JWT Token并解析
     * @param token 客户端传入的Token
     * @return 如果验证成功，返回解析后的DecodedJWT对象；否则返回null
     */
    public static DecodedJWT verifyToken(String token) {
        try {
            // 1. 使用相同的算法和秘钥创建验证器
            Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer("OurMusicApp") // 验证签发者
                    .build();

            // 2. 验证Token
            DecodedJWT decodedJWT = verifier.verify(token);
            return decodedJWT;

        } catch (JWTVerificationException exception) {
            // Token验证失败 (例如，签名错误、Token过期等)
            System.err.println("Token is invalid: " + exception.getMessage());
            throw new JWTVerificationException("Token is invalid: " + exception.getMessage());
        }
    }

    /**
     * 判断accessToken是否过期
     * @param decodedJWT 传入的access token
     * @return 返回Boolean
     */
    public static Boolean isTokenTimeOut(DecodedJWT decodedJWT) {

        Date expiration = decodedJWT.getExpiresAt();

        return expiration.before(new Date());

    }


}
