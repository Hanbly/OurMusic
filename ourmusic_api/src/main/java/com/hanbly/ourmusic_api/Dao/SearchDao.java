package com.hanbly.ourmusic_api.Dao;

import com.hanbly.ourmusic_api.pojo.Search;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchDao extends JpaRepository<Search, Integer>, JpaSpecificationExecutor<Search> {

    @Query("SELECT s FROM Search s WHERE s.user.userId = :userId AND s.searchType = com.hanbly.ourmusic_api.pojo.Search.SearchType.POSITIVE ORDER BY s.searchTimestamp ASC")
    List<Search> findAllByUserIdAndTypePositive(@Param("userId") Integer userId);

    Boolean existsBySearchContentAndUser_UserIdAndSearchType(@Param("searchContent") String searchContent, @Param("userId") Integer userId, @Param("searchType") Search.SearchType searchType);

}
