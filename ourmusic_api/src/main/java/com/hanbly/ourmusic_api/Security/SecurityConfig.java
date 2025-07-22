package com.hanbly.ourmusic_api.Security;
import com.hanbly.ourmusic_api.Security.JwtAuthenticationTokenFilter;

import jakarta.annotation.Resource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import static org.springframework.security.config.Customizer.withDefaults;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
// @PreAuthorize(value = "hasRole('admin')")
// @PreAuthorize(value = "hasRole('admin', 'cfo')")
// @PreAuthorize(value = "hasRole('admin') and hasRole('ceo')")
// @PreAuthorize(value = "hasRole('admin')")
public class SecurityConfig {

    @Resource
    private JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter;
    @Resource
    UnAuthorizedEnterPointHandler unAuthorizedEnterPointHandler;
    @Resource
    LoginUnAccessDeniedHandler loginUnAccessDeniedHandler;

    /**
     * security过滤器链
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 告诉 Spring Security 使用我们下面定义的 CorsConfigurationSource
                .cors(withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/user/send-email/**",
                                "/api/user/send-reset-email/**",
                                "/api/user/password/refresh",
                                "/api/user/login",
                                "/api/user/refresh",
                                "/api/user/register",
                                "/api/music/batch",
                                "/api/music/week-hot",
                                "/api/collection/batch").permitAll()
                        .anyRequest().authenticated()
                )
                .csrf(AbstractHttpConfigurer::disable);
        // token 验证拦截，可以解决请求无状态问题
        http.addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class);

//        // 权限不足处理
//        http.exceptionHandling(ex -> ex.accessDeniedHandler(loginUnAccessDeniedHandler));
//
//        // 匿名用户请求处理
//        http.exceptionHandling(ex -> ex.authenticationEntryPoint(unAuthorizedEnterPointHandler));

        http.exceptionHandling(ex -> ex
                .accessDeniedHandler(loginUnAccessDeniedHandler)
                .authenticationEntryPoint(unAuthorizedEnterPointHandler)
        );


        return http.build();
    }

    /**
     * 加密工具
     */
    @Bean
    public PasswordEncoder encoder(){
        return new BCryptPasswordEncoder();
    }

    /**
     * 配置认证管理器
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * CORS处理
     * 定义详细的 CORS 规则，替代 WebMvcConfigurer
     */

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 允许你的前端源
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        // 允许所有请求方法
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 允许所有请求头
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // 允许携带凭证
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 对所有 URL 应用这个配置
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
