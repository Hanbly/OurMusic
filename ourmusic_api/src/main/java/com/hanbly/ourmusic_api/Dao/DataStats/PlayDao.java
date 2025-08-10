package com.hanbly.ourmusic_api.Dao.DataStats;

import com.hanbly.ourmusic_api.pojo.DataStats.Play;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PlayDao extends JpaRepository<Play, Integer>, JpaSpecificationExecutor<Play> {

    Integer countAllByPlayOwnerTypeAndPlayOwnerId(Play.OwnerType playOwnerType, Integer playOwnerId);

    List<Play> findAllByPlayTimestampGreaterThanEqual(Instant playTimestamp);

    Play findByPlayOwnerTypeAndPlayOwnerIdAndPlayedByUser_UserId(Play.OwnerType owner, Integer playOwnerId, Integer userId);

}
