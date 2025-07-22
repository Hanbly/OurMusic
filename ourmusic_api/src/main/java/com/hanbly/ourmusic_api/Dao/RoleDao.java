package com.hanbly.ourmusic_api.Dao;

import com.hanbly.ourmusic_api.pojo.RBAC.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleDao extends JpaRepository<Role, Integer>, JpaSpecificationExecutor<Role> {

    Role findByRoleName(String roleName);

}
