package com.hanbly.ourmusic_api.Service;

import com.hanbly.ourmusic_api.pojo.MusicCollection;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDtoDetail;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDtoHistory;

import java.util.List;

public interface MusicCollectionService {
    MusicCollection addCollection(MusicCollectionDto collection);

    MusicCollectionDtoDetail getCollectionByCollectionId(Integer collectionId);

//    MusicCollection updateMusicToCollection(Integer collectionId, Integer musicId);
//
//    MusicCollection updateMusicToUserHistory(Integer userId, Integer musicId);
//
//    MusicCollection updateMusicToUserDefault(Integer userId, Integer musicId);
//
//    MusicCollection updateMusicToCollectionBatch(Integer collectionId, List<Integer> musicIds);

    MusicCollection updateCollection(MusicCollectionDto collection);

//    MusicCollection updateMusicOutCollection(Integer collectionId, Integer musicId);
//
//    MusicCollection updateMusicOutUserHistory(Integer userId, Integer musicId);
//
//    MusicCollection updateMusicOutUserDefault(Integer userId, Integer musicId);
//
//    MusicCollection updateMusicOutCollectionBatch(Integer collectionId, List<Integer> musicIds);

    void deleteCollectionByCollectionId(Integer collectionId);

    void deleteCollectionByCollectionIds(List<Integer> collectionIds);

    List<MusicCollectionDto> getCollectionBySomething(Integer userId, String collectionName, String collectionGenre, String mode);

    List<MusicCollectionDto> getCollectionByUserId(Integer userId, String searchState);

    List<MusicCollectionDto> getMarkedCollectionByUserId(Integer userId);

    MusicCollectionDtoHistory getHistoryCollectionByUserId(Integer userId);

//    void updateMusicLikeCount(Integer collectionId, String state);
}
