package com.hanbly.ourmusic_api.Security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hanbly.ourmusic_api.Dao.UserDao;
import com.hanbly.ourmusic_api.Utils.JwtUtils;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private UserDao userDao;
    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // 提前处理没有 token 的情况，代码更清晰
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwtToken = authHeader.substring(7);

        try {
            // **修正1: 使用注入的实例来调用方法**
            DecodedJWT decodedJWT = jwtUtils.verifyToken(jwtToken);

            String userIdStr = decodedJWT.getClaim("userId").asString();

            // **修正2: 增加对 userIdStr 的健壮性检查**
            if (userIdStr == null) {
                throw new JWTVerificationException("令牌中缺少 userId 信息");
            }

            Integer userId = Integer.parseInt(userIdStr); // NumberFormatException 会在这里被抛出

            // BadCredentialsException 会在这里被抛出
            User user = userDao.findById(userId).orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("令牌有效，但用户不存在"));

            String username = user.getUserName();

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            // **修正3: 捕获 BadCredentialsException**
            logger.warn("无效的凭证 (用户不存在): {}", e);
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "凭证无效，用户可能已被删除");
            return;
        } catch (NumberFormatException e) {
            // **修正4: 捕获 NumberFormatException**
            logger.warn("令牌中的 userId 格式错误: {}", e);
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, "令牌格式错误，无法解析用户ID");
            return;
        } catch (JWTVerificationException e) {  // 先捕获父类异常
            if (e.getMessage().contains("expired")) {
                logger.warn("JWT 令牌已过期: {}", e);
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "令牌已过期");
            } else {
                logger.warn("JWT 令牌无效: {}", e);
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "令牌无效，请重新登录");
            }
            return;
        } catch (Exception e) {
            // 最后的保障，捕获所有其他未预料到的异常
            logger.error("JWT 过滤器发生未知错误", e); // 打印完整的堆栈信息，方便排查
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "服务器内部认证错误");
            return; // 同样需要 return
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 辅助方法，用于发送自定义的JSON错误响应
     * @param response HttpServletResponse 对象
     * @param status HTTP 状态码
     * @param message 错误信息
     * @throws IOException
     */
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

