package com.hanbly.ourmusic_api.Dao.DataStats;

import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.CountDto;
import com.hanbly.ourmusic_api.pojo.DataStats.Dislike;
import com.hanbly.ourmusic_api.pojo.DataStats.Dislike;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface DislikeDao extends JpaRepository<Dislike, Integer>, JpaSpecificationExecutor<Dislike> {

    Integer countAllByDislikeOwnerTypeAndDislikeOwnerId(Dislike.OwnerType dislikeOwnerType, Integer dislikeOwnerId);

    @Query("SELECT l.dislikeOwnerId, COUNT(l) FROM Dislike l WHERE l.dislikeOwnerType = com.hanbly.ourmusic_api.pojo.DataStats.Dislike.OwnerType.COMMENT AND l.dislikeOwnerId IN :commentIds GROUP BY l.dislikeOwnerId")
    List<Object[]> findDislikeCountsForCommentIdsGroupedByCommentId(@Param("commentIds") Set<Integer> commentIds);

    @Query("SELECT l.dislikeOwnerId, COUNT(l) FROM Dislike l WHERE l.dislikeOwnerType = :dislikeOwnerType AND l.dislikeOwnerId IN :ids GROUP BY l.dislikeOwnerId")
    List<CountDto> findDislikeCountsForIdsGroupedById(@Param("dislikeOwnerType") Dislike.OwnerType dislikeOwnerType, @Param("ids") Set<Integer> ids);

    Dislike findByDislikeOwnerTypeAndDislikeOwnerIdAndDislikedByUser_UserId(Dislike.OwnerType dislikeOwnerType, Integer dislikeOwnerId, Integer dislikedByUserId);

    Boolean existsByDislikeOwnerTypeAndDislikeOwnerIdAndDislikedByUser_UserId(Dislike.OwnerType dislikeOwnerType, Integer dislikeOwnerId, Integer dislikedByUserId);

}
