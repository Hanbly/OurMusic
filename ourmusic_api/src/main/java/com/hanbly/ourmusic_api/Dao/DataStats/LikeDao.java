package com.hanbly.ourmusic_api.Dao.DataStats;

import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.CountDto;
import com.hanbly.ourmusic_api.pojo.DataStats.Like;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface LikeDao extends JpaRepository<Like, Integer>, JpaSpecificationExecutor<Like> {

    Integer countAllByLikeOwnerTypeAndLikeOwnerId(Like.OwnerType likeOwnerType, Integer likeOwnerId);

    @Query("SELECT COUNT(l) FROM Like l JOIN l.likedByUser u WHERE u.userId = :userId ")
    Integer countLikeByUserId(@Param("userId") Integer userId);

    @Query("SELECT l.likeOwnerId, COUNT(l) FROM Like l WHERE l.likeOwnerType = com.hanbly.ourmusic_api.pojo.DataStats.Like.OwnerType.COMMENT AND l.likeOwnerId IN :commentIds GROUP BY l.likeOwnerId")
    List<Object[]> findLikeCountsForCommentIdsGroupedByCommentId(@Param("commentIds") Set<Integer> commentIds);

    @Query("SELECT l.likeOwnerId, COUNT(l) FROM Like l WHERE l.likeOwnerType = :likeOwnerType AND l.likeOwnerId IN :ids GROUP BY l.likeOwnerId")
    List<CountDto> findLikeCountsForIdsGroupedById(@Param("likeOwnerType") Like.OwnerType likeOwnerType, @Param("ids") Set<Integer> ids);

    Like findByLikeOwnerTypeAndLikeOwnerIdAndLikedByUser_UserId(Like.OwnerType likeOwnerType, Integer likeOwnerId, Integer likedByUserId);

    Boolean existsByLikeOwnerTypeAndLikeOwnerIdAndLikedByUser_UserId(Like.OwnerType likeOwnerType, Integer likeOwnerId, Integer likedByUserId);
}
