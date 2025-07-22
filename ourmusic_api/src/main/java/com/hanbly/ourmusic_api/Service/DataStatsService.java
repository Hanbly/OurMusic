package com.hanbly.ourmusic_api.Service;

import com.hanbly.ourmusic_api.pojo.ResponseMessage;

public interface DataStatsService {
    ResponseMessage<String> updateLike(String likeOwnerType, Integer likeOwnerId, Integer likeDidUserId);

    ResponseMessage<String> updateDislike(String dislikeOwnerType, Integer dislikeOwnerId, Integer dislikeDidUserId);

    ResponseMessage<String> updateCollect(String collectOwnerType, Integer collectOwnerId, Integer collectDidUserId, Integer collectionId);

    ResponseMessage<String> updateHistory(Integer musicId, Integer userId);

    ResponseMessage<String> deleteHistory(Integer musicId, Integer userId);

    ResponseMessage<String> updateDefault(Integer musicId, Integer userId);
}
