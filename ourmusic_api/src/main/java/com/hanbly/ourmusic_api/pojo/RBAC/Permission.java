package com.hanbly.ourmusic_api.pojo.RBAC;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_permission")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    private Integer permissionId;

    /**
     * 权限名称/标识符，应该是唯一的。
     * 例如："USER_MANAGE", "MUSIC_UPLOAD", "COMMENT_DELETE"
     */
    @Column(name = "permission_name", unique = true, nullable = false)
    private String permissionName;

    @Column(name = "permission_description")
    private String permissionDescription;

    public Integer getPermissionId() {
        return permissionId;
    }

    public void setPermissionId(Integer permissionId) {
        this.permissionId = permissionId;
    }

    public String getPermissionName() {
        return permissionName;
    }

    public void setPermissionName(String permissionName) {
        this.permissionName = permissionName;
    }

    public String getPermissionDescription() {
        return permissionDescription;
    }

    public void setPermissionDescription(String permissionDescription) {
        this.permissionDescription = permissionDescription;
    }
}