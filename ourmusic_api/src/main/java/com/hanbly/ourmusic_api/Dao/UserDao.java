package com.hanbly.ourmusic_api.Dao;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserDao extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {

    Optional<User> findByUserName(String userName);

    User findByEmail(String email);

    Boolean existsByUserName(String userName);

    Boolean existsByEmail(String email);

    User findByMusics_MusicId(Integer musicId);

    User findByCollections_CollectionId(Integer collectionId);

    List<User> findAllByMusics_MusicIdIn(List<Integer> musicIds);

    @Query("SELECT u FROM User u WHERE u.userId IN :userIds")
    List<User> findUserByIds(Set<Integer> userIds);

}
