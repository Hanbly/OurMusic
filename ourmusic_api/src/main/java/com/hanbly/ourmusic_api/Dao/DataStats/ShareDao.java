package com.hanbly.ourmusic_api.Dao.DataStats;

import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.CountDto;
import com.hanbly.ourmusic_api.pojo.DataStats.Share;
import com.hanbly.ourmusic_api.pojo.DataStats.Share;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ShareDao extends JpaRepository<Share, Integer>, JpaSpecificationExecutor<Share> {

    Integer countAllByShareOwnerTypeAndShareOwnerId(Share.OwnerType shareOwnerType, Integer shareOwnerId);

    @Query("SELECT l.shareOwnerId, COUNT(l) FROM Share l WHERE l.shareOwnerType = :shareOwnerType AND l.shareOwnerId IN :ids GROUP BY l.shareOwnerId")
    List<CountDto> findShareCountsForIdsGroupedById(@Param("shareOwnerType") Share.OwnerType shareOwnerType, @Param("ids") Set<Integer> ids);
}
