package com.hanbly.ourmusic_api.Controller;

import com.hanbly.ourmusic_api.Service.DataStatsService;
import com.hanbly.ourmusic_api.pojo.DataStats.DSdto.SimpleCollectStatsOwner;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data-stats")
public class DataStatsController {

    @Autowired
    private DataStatsService dataStatsService;

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #likeDidUserId")
    @PostMapping("/like/{likeOwnerType}/{likeOwnerId}/user/{likeDidUserId}")     // URL: localhost:8080/api/data-stats/like/{likeOwnerType}/{likeOwnerId}/user/{likeDidUserId} method: POST
    public ResponseMessage<String> updateLike(@PathVariable String likeOwnerType, @PathVariable Integer likeOwnerId, @PathVariable Integer likeDidUserId){
        return dataStatsService.updateLike(likeOwnerType, likeOwnerId, likeDidUserId);
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #dislikeDidUserId")
    @PostMapping(value = "/dislike/{dislikeOwnerType}/{dislikeOwnerId}/user/{dislikeDidUserId}")        // URL: localhost:8080/api/data-stats/dislike/{dislikeOwnerType}/{dislikeOwnerId}/user/{dislikeDidUserId} method: POST
    public ResponseMessage<String> updateDislike(@PathVariable String dislikeOwnerType, @PathVariable Integer dislikeOwnerId, @PathVariable Integer dislikeDidUserId){
        return dataStatsService.updateDislike(dislikeOwnerType, dislikeOwnerId, dislikeDidUserId);
    }

    /**
     * 音乐收藏（到歌单）、歌单收藏
     * @param collectOwnerType
     * @param collectOwnerId
     * @param collectDidUserId
     * @param collectionId
     * @return 响应信息
     */
    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #collectDidUserId")
    @PutMapping(value = "/collect/{collectOwnerType}/{collectOwnerId}/user/{collectDidUserId}/to-collection/{collectionId}")     // URL: localhost:8080/api/data-stats/collect/{collectOwnerType}/{collectOwnerId}/user/{collectDidUserId}/to-collection/{collectionId} method: PUT
    public ResponseMessage<String> updateCollect(@PathVariable String collectOwnerType, @PathVariable Integer collectOwnerId, @PathVariable Integer collectDidUserId, @PathVariable(required = false) Integer collectionId){
        return dataStatsService.updateCollect(collectOwnerType, collectOwnerId, collectDidUserId, collectionId);
    }

    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #userId")
    @PutMapping(value = "/collect/MUSIC/{musicId}/user/{userId}/history")      // URL: localhost:8080/api/data-stats/collect/MUSIC/{musicId}/user/{userId}/history method: Put
    public ResponseMessage<String> updateHistory(@PathVariable Integer musicId, @PathVariable Integer userId){
        return dataStatsService.updateHistory(musicId, userId);
    }

    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #userId")
    @DeleteMapping(value = "/collect/MUSIC/{musicId}/user/{userId}/history")
    ResponseMessage<String> deleteHistory(@PathVariable Integer musicId, @PathVariable Integer userId){
        return dataStatsService.deleteHistory(musicId, userId);
    }

    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #userId")
    @PutMapping(value = "/collect/MUSIC/{musicId}/user/{userId}/default")      // URL: localhost:8080/api/data-stats/collect/MUSIC/{musicId}/user/{userId}/default method: Put
    public ResponseMessage<String> updateDefault(@PathVariable Integer musicId, @PathVariable Integer userId){
        return dataStatsService.updateDefault(musicId, userId);
    }

    /**
     * 音乐取消收藏（从歌单）
     * @param collectOwnerType 收藏记录类型
     * @param collectOwnerId 收藏记录拥有者id
     * @param collectDidUserId 收藏记录操作用户id
     * @param collectionId 收藏记录有关联的歌单id
     * @return 响应信息
     */
    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #collectDidUserId")
    @PutMapping(value = "/d-collect/{collectOwnerType}/{collectOwnerId}/user/{collectDidUserId}/out-collection/{collectionId}")     // URL: localhost:8080/api/data-stats/d-collect/{collectOwnerType}/{collectOwnerId}/user/{collectDidUserId}/out-collection/{collectionId} method: PUT
    public ResponseMessage<String> deleteCollectFromMC(@PathVariable String collectOwnerType, @PathVariable Integer collectOwnerId, @PathVariable Integer collectDidUserId, @PathVariable(required = true) Integer collectionId){
        return dataStatsService.deleteCollectFromMC(collectOwnerType, collectOwnerId, collectDidUserId, collectionId);
    }

    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #collectDidUserId")
    @PutMapping(value = "/batch-a-collect/user/{collectDidUserId}/to-collection/{collectionId}")     // URL: localhost:8080/api/data-stats/batch-a-collect/user/{collectDidUserId}/to-collection/{collectionId} method: PUT
    public ResponseMessage<String> addCollectsIntoMC(@RequestBody List<SimpleCollectStatsOwner> collectStatsOwners, @PathVariable Integer collectDidUserId, @PathVariable(required = true) Integer collectionId){
        return dataStatsService.addCollectsIntoMC(collectStatsOwners, collectDidUserId, collectionId);
    }

    @PreAuthorize("hasRole('admin') or authentication.principal.getUserId() == #collectDidUserId")
    @PutMapping(value = "/batch-d-collect/user/{collectDidUserId}/out-collection/{collectionId}")     // URL: localhost:8080/api/data-stats/batch-d-collect/user/{collectDidUserId}/out-collection/{collectionId} method: PUT
    public ResponseMessage<String> deleteCollectsFromMC(@RequestBody List<SimpleCollectStatsOwner> collectStatsOwners, @PathVariable Integer collectDidUserId, @PathVariable(required = true) Integer collectionId){
        return dataStatsService.deleteCollectsFromMC(collectStatsOwners, collectDidUserId, collectionId);
    }

}
