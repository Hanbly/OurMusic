package com.hanbly.ourmusic_api.Dao.DataStats;

import com.hanbly.ourmusic_api.pojo.DataStats.CollectStats;
import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.CountDto;
import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.MusicTimestampDto;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Repository
public interface CollectStatsDao extends JpaRepository<CollectStats, Integer>, JpaSpecificationExecutor<CollectStats> {

    Integer countAllByCollectStatsOwnerTypeAndCollectStatsOwnerId(CollectStats.OwnerType collectStatsOwnerType, Integer collectStatsOwnerId);

    Integer countAllByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsToCollection_CollectionNameNot(CollectStats.OwnerType collectStatsOwnerType, Integer collectStatsOwnerId, String collectionName);

    // 歌单收藏了多少音乐
    Integer countAllByCollectStatsOwnerTypeAndCollectStatsToCollection_CollectionId(CollectStats.OwnerType collectStatsOwnerType, Integer collectStatsOwnerId);

    // 用户收藏了多少歌单
    // 用户收藏了多少音乐
    Integer countAllByCollectStatsOwnerTypeAndCollectStatsdByUser_UserId(CollectStats.OwnerType collectStatsOwnerType, Integer collectStatsOwnerId);

    CollectStats findByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionId(CollectStats.OwnerType collectStatsOwnerType, Integer collectStatsOwnerId, Integer collectStatsdByUserId, Integer collectStatsToCollectionId);

    List<CollectStats> findAllByCollectStatsOwnerTypeAndCollectStatsOwnerIdInAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionId(CollectStats.OwnerType collectStatsOwnerType, List<Integer> collectStatsOwnerIds, Integer collectStatsdByUserId, Integer collectStatsToCollectionId);

    CollectStats findByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserId(CollectStats.OwnerType collectStatsOwnerType, Integer collectStatsOwnerId, Integer collectStatsdByUserId);

    Boolean existsByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserId(CollectStats.OwnerType collectStatsOwnerType, Integer collectStatsOwnerId, Integer collectStatsdByUserId);

    Boolean existsByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionNameNot(CollectStats.OwnerType collectStatsOwnerType, Integer collectStatsOwnerId, Integer collectStatsdByUserId, String collectionName);

    Boolean existsByCollectStatsOwnerTypeAndCollectStatsOwnerIdAndCollectStatsdByUser_UserIdAndCollectStatsToCollection_CollectionIdAndCollectStatsToCollection_CollectionNameNot(CollectStats.OwnerType collectStatsOwnerType, Integer collectStatsOwnerId, Integer collectStatsdByUserId, Integer collectionId, String collectionName);

    @Query("SELECT cs.collectStatsOwnerId, COUNT(cs) FROM CollectStats cs WHERE cs.collectStatsOwnerType = :collectStatsOwnerType AND cs.collectStatsOwnerId IN :ids GROUP BY cs.collectStatsOwnerId")
    List<CountDto> findCollectStatsCountsForIdsGroupedById(@Param("collectStatsOwnerType") CollectStats.OwnerType collectStatsOwnerType, @Param("ids") Set<Integer> ids);

    @Query("SELECT cs.collectStatsOwnerId, COUNT(cs) FROM CollectStats cs " +
            "JOIN cs.collectStatsToCollection mc " +
            "WHERE cs.collectStatsOwnerType = :collectStatsOwnerType " +
            "AND mc.collectionName NOT LIKE :mcName " +
            "AND cs.collectStatsOwnerId IN :ids GROUP BY cs.collectStatsOwnerId")
    List<CountDto> findCollectStatsCountsForIdsGroupedByIdButNotHistory(@Param("collectStatsOwnerType") CollectStats.OwnerType collectStatsOwnerType, @Param("ids") Set<Integer> ids, @Param("mcName") String mcName);

    @Query("SELECT cs.collectStatsOwnerId, Max(cs.collectStatsTimestamp) " +
            "FROM CollectStats cs " +
            "WHERE cs.collectStatsOwnerType = :collectStatsOwnerType " +
            "AND cs.collectStatsOwnerId IN :ids " +
            "AND cs.collectStatsdByUser.userId = :userId " +
            "AND cs.collectStatsToCollection.collectionId = :collectionId " +
            "GROUP BY cs.collectStatsOwnerId")
    List<MusicTimestampDto> findCollectStatsTimestampsForIdsAndDidUserIdAndCollectionIdGroupedById(
            @Param("collectStatsOwnerType") CollectStats.OwnerType collectStatsOwnerType,
            @Param("userId") Integer userId,
            @Param("collectionId") Integer collectionId,
            @Param("ids") Set<Integer> ids);

    @Query("SELECT COUNT(cs) FROM CollectStats cs JOIN Music m ON cs.collectStatsOwnerId = m.musicId JOIN cs.collectStatsToCollection mc WHERE m.user.userId = :userId AND mc.collectionName != '历史记录'")
    Integer countMusicCollectStatsByUserId(@Param("userId") Integer userId);

    @Query("SELECT COUNT(cs) FROM CollectStats cs JOIN MusicCollection mc ON cs.collectStatsOwnerId = mc.collectionId WHERE mc.user.userId = :userId")
    Integer countMusicCollectionCollectStatsByUserId(@Param("userId") Integer userId);
}
