package com.hanbly.ourmusic_api.pojo.RBAC;

import jakarta.persistence.*;

import java.util.Collection;
import java.util.Set;

@Entity
@Table(name = "tb_role")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;

    /**
     * 角色名称，应该是唯一的。
     * 遵循Spring Security的惯例，通常以 "ROLE_" 开头，例如 "ROLE_ADMIN", "ROLE_USER"。
     */
    @Column(name = "role_name", unique = true, nullable = false)
    private String roleName;

    @Column(name = "role_description")
    private String roleDescription;

    /**
     * Role与Permission的多对多关系。
     * 一个角色可以拥有多个权限。
     * FetchType.EAGER 表示在查询Role时，会立即加载其关联的权限。
     * 对于大型应用，更推荐使用 LAZY，在需要时再加载。
     */
    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(
            name = "tb_role_permission", // 定义中间关联表的名称
            joinColumns = @JoinColumn(name = "role_id"), // 定义本类（Role）在中间表的外键列
            inverseJoinColumns = @JoinColumn(name = "permission_id") // 定义关联另一方（Permission）在中间表的外键列
    )
    private Collection<Permission> permissions;

    public Role(String roleName) {
        this.roleName = roleName;
    }

    public Role() {

    }

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getRoleDescription() {
        return roleDescription;
    }

    public void setRoleDescription(String roleDescription) {
        this.roleDescription = roleDescription;
    }

    public Collection<Permission> getPermissions() {
        return permissions;
    }

    public void setPermissions(Collection<Permission> permissions) {
        this.permissions = permissions;
    }
}