package com.hanbly.ourmusic_api.Dao.DataStats;

import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.CountDto;
import com.hanbly.ourmusic_api.pojo.DataStats.Download;
import com.hanbly.ourmusic_api.pojo.DataStats.Like;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface DownloadDao extends JpaRepository<Download, Integer>, JpaSpecificationExecutor<Download> {

    Integer countAllByDownloadOwnerTypeAndDownloadOwnerId(Download.OwnerType downloadOwnerType, Integer downloadOwnerId);

    @Query("SELECT new com.hanbly.ourmusic_api.pojo.DataStats.DSdto.CountDto(l.downloadOwnerId, COUNT(l)) FROM Download l WHERE l.downloadOwnerType = :downloadOwnerType AND l.downloadOwnerId IN :ids GROUP BY l.downloadOwnerId")
    List<CountDto> findDownloadCountsForIdsGroupedById(@Param("downloadOwnerType") Download.OwnerType downloadOwnerType, @Param("ids") Set<Integer> ids);
}
