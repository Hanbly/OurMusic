package com.hanbly.ourmusic_api.Security.pojo;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class CustomUserDetails implements UserDetails {

    private Integer userId; // 确保有这个字段
    private Integer userImageFileId;
    private String userImageFileUrl;
    private String username;
    private List<String> userRoles;
    private String password; // 这是数据库中加密后的密码
    private Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails() {
    }

    public CustomUserDetails(Integer userId, Integer userImageFileId, String userImageFileUrl, String username, String password, List<String> rolesNames, List<String> permissionsNames) {
        this.userId = userId;
        this.userImageFileId = userImageFileId;
        this.userImageFileUrl = userImageFileUrl;
        this.username = username;
        this.userRoles = rolesNames;
        this.password = password;

        List<GrantedAuthority> authorities = new ArrayList<>();
        rolesNames.forEach(roleName -> authorities.add(new SimpleGrantedAuthority("ROLE_"+roleName)));
        permissionsNames.forEach(permissionName -> authorities.add(new SimpleGrantedAuthority(permissionName)));
        this.authorities = authorities;
    }

    // 关键：提供一个 public 的 getter 方法
    public Integer getUserId() {
        return userId;
    }

    public Integer getUserImageFileId() {
        return userImageFileId;
    }

    public String getUserImageFileUrl() {
        return userImageFileUrl;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public List<String> getUserRoles() {
        return userRoles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

}