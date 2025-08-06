package com.hanbly.ourmusic_api.Service;

import com.hanbly.ourmusic_api.pojo.MusicCollection;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDtoDetail;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDtoHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MusicCollectionService {
    MusicCollection addCollection(MusicCollectionDto collection);

    MusicCollectionDtoDetail getCollectionByCollectionId(Integer collectionId, Pageable musicPageable);

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

    Page<MusicCollectionDto> getCollectionBySomething(Integer userId, String collectionName, String collectionGenre, String mode, Pageable pageable);

    Page<MusicCollectionDto> getCollectionByUserId(Integer userId, String searchState, Pageable pageable);

    Page<MusicCollectionDto> getMarkedCollectionByUserId(Integer userId, Pageable pageable);

    MusicCollectionDtoHistory getHistoryCollectionByUserId(Integer userId, Pageable pageable);

//    void updateMusicLikeCount(Integer collectionId, String state);
}
