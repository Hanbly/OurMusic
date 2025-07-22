package com.hanbly.ourmusic_api.Dao;

import com.hanbly.ourmusic_api.pojo.RBAC.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionDao extends JpaRepository<Permission, Integer>, JpaSpecificationExecutor<Permission> {
}
