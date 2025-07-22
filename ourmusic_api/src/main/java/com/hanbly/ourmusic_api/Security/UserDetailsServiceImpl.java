package com.hanbly.ourmusic_api.Security;

import com.hanbly.ourmusic_api.Dao.FileDao;
import com.hanbly.ourmusic_api.Dao.PermissionDao;
import com.hanbly.ourmusic_api.Dao.RoleDao;
import com.hanbly.ourmusic_api.Dao.UserDao;
import com.hanbly.ourmusic_api.Security.pojo.CustomUserDetails;
import com.hanbly.ourmusic_api.pojo.CustomFile;
import com.hanbly.ourmusic_api.pojo.RBAC.Permission;
import com.hanbly.ourmusic_api.pojo.RBAC.Role;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


/**
 * 从数据库获取用户信息，将信息使用LoginUserDetails封装后送给security
 */
@Transactional
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserDao userDao;
    @Autowired
    private RoleDao roleDao;
    @Autowired
    private PermissionDao permissionDao;
    @Autowired
    private FileDao fileDao;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userDao.findByUserName(username).orElseThrow(()->new UsernameNotFoundException(username));
        if(user == null) {
            throw new UsernameNotFoundException(username);
        }

        List<String> rolesNames;
        List<String> permissionsNames = new ArrayList<>();

        Collection<Role> roles = user.getRoles();
        rolesNames = roles.stream().map(Role::getRoleName).collect(Collectors.toList());

        if(!rolesNames.isEmpty()) {
            for(Role role : roles) {
                Collection<Permission> permissionNames = role.getPermissions();
//                permissionNames.forEach(permission -> {
//                    permissionsNames.add(permission.getPermissionName());
//                });
                permissionsNames.addAll(permissionNames.stream().map(Permission::getPermissionName).toList());
            }
        }

        return new CustomUserDetails(
                user.getUserId(),      // 把 userId 传进去
                user.getUserAvatarFile() != null ? user.getUserAvatarFile().getCustomFileId() : null,
                user.getUserAvatarFile() != null ? user.getUserAvatarFile().getFileUrl() : null,
                user.getUserName(),
                user.getPassword(),

                rolesNames,
                permissionsNames
        );
    }
}
