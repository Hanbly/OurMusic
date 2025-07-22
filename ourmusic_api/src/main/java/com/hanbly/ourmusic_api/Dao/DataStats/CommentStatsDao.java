package com.hanbly.ourmusic_api.Dao.DataStats;

import com.hanbly.ourmusic_api.pojo.DataStats.CommentStats;
import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.CountDto;
import com.hanbly.ourmusic_api.pojo.DataStats.Download;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Repository
public interface CommentStatsDao extends JpaRepository<CommentStats, Integer>, JpaSpecificationExecutor<CommentStats> {

    Integer countAllByCommentStatsOwnerTypeInAndCommentStatsOwnerIdIn(List<CommentStats.OwnerType> commentStatsOwnerType, List<Integer> commentStatsOwnerId);

    @Query("SELECT l.commentStatsOwnerId, COUNT(l) FROM CommentStats l WHERE l.commentStatsOwnerType = :commentStatsOwnerType AND l.commentStatsOwnerId IN :ids GROUP BY l.commentStatsOwnerId")
    List<CountDto> findCommentStatsCountsForIdsGroupedById(@Param("commentStatsOwnerType") CommentStats.OwnerType commentStatsOwnerType, @Param("ids") Set<Integer> ids);

    // 计算所有评论和子评论数
    List<CommentStats> findAllByCommentStatsOwnerTypeAndCommentStatsOwnerIdIn(CommentStats.OwnerType commentStatsOwnerType, Set<Integer> commentStatsOwnerId);
    List<CommentStats> findByCommentStatsOwnerTypeAndCommentStatsOwnerId(CommentStats.OwnerType commentStatsOwnerType, Integer commentStatsOwnerId);
    Integer countAllByCommentStatsOwnerTypeAndCommentStatsOwnerId(CommentStats.OwnerType commentStatsOwnerType, Integer commentStatsOwnerId);
}
