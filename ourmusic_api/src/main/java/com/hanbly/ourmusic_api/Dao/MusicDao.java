package com.hanbly.ourmusic_api.Dao;

import com.hanbly.ourmusic_api.Dao.CustomRepositoryInterface.MusicRepositoryCustom;
import com.hanbly.ourmusic_api.pojo.DataStats.CollectStats;
import com.hanbly.ourmusic_api.pojo.Music;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MusicDao extends JpaRepository<Music, Integer>, JpaSpecificationExecutor<Music>, MusicRepositoryCustom {

//    @Query("SELECT m FROM Music m " +
//            "JOIN CustomFile cf ON m.musicFile.customFileId = cf.customFileId " +
//            "WHERE m.user.userId = :userId " +
//            "ORDER BY cf.uploadTimestamp DESC ")
    Page<Music> findAllByUser_UserIdOrderByMusicFile_UploadTimestampDesc(Integer userId, Pageable pageable);

    List<Music> findAllByMusicGenreOrMusicNameOrMusicArtistOrMusicAlbumOrMusicYear(String genre, String name, String artist, String album, String year);

    List<Music> findAllByMusicGenreContaining(String genre);

    List<Music> findAllByMusicNameContaining(String name);

    List<Music> findAllByMusicArtistContaining(String artist);

    List<Music> findAllByMusicAlbumContaining(String album);

    List<Music> findAllByMusicYearContaining(String year);

    @Query("SELECT m FROM Music m " +
            "JOIN CollectStats cs ON m.musicId = cs.collectStatsOwnerId " +
            "WHERE cs.collectStatsToCollection.collectionId = :collectionId " +
            "AND cs.collectStatsOwnerType = :ownerType " +
            "ORDER BY cs.collectStatsTimestamp DESC ")
    Page<Music> findMusicByCollectionIdAndOwnerTypeSortedByTimestamp(
            @Param("collectionId") Integer collectionId,
            @Param("ownerType") CollectStats.OwnerType ownerType,
            Pageable pageable
    );

}
