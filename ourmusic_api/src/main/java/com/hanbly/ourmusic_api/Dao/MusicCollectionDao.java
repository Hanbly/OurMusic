package com.hanbly.ourmusic_api.Dao;


import com.hanbly.ourmusic_api.pojo.MusicCollection;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MusicCollectionDao extends JpaRepository<MusicCollection, Integer>, JpaSpecificationExecutor<MusicCollection> {

    /**
     * 根据用户ID查询，并按CollectionId升序排序
     * findByUserId -> WHERE userId = ?
     * OrderByCollectionIdAsc -> ORDER BY collectionId ASC
     */
    List<MusicCollection> findByUserOrderByCollectionIdAsc(User user);

    /**
     * 根据用户查询历史记录和默认收藏
     */
    MusicCollection findByUserAndCollectionName(User user, String collectionName);

    List<MusicCollection> findByUserAndCollectionStatusNot(User user, MusicCollection.CollectionStatus collectionStatus);

}
