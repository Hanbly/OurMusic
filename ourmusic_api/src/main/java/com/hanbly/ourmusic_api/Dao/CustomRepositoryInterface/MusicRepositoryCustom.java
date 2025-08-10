package com.hanbly.ourmusic_api.Dao.CustomRepositoryInterface;

import com.hanbly.ourmusic_api.pojo.Music;

import java.util.List;

public interface MusicRepositoryCustom {

    /**
     * 根据多个可选条件进行数据库粗筛，获取候选集。
     * 所有动态查询的复杂逻辑都将封装在这个方法的实现中。
     */
    List<Music> findCandidatesByCriteria(
            String genre, String musicName, String musicArtist,
            String musicAlbum, String musicYear
    );

}
