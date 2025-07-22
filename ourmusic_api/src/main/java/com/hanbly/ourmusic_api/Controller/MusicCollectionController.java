package com.hanbly.ourmusic_api.Controller;

import com.hanbly.ourmusic_api.Service.MusicCollectionService;
import com.hanbly.ourmusic_api.pojo.MusicCollection;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDtoDetail;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDto;
import com.hanbly.ourmusic_api.pojo.dto.MusicCollectionDtoHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.hanbly.ourmusic_api.Utils.TransformEntityToDto.transformCollectionEntityToDto;

@RestController
@RequestMapping("/api/collection")
public class MusicCollectionController {

    @Autowired
    private MusicCollectionService musicCollectionService;

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #collection.userId")
    @PostMapping        // URL: localhost:8080/api/collection  method: POST
    public ResponseMessage<MusicCollectionDto> addCollection(@Validated @RequestBody MusicCollectionDto collection) {
        MusicCollection newCollection = musicCollectionService.addCollection(collection);
        newCollection.getUser().setPassword(null);
//        newCollection.getMusics().forEach(music -> {music.getUser().setPassword(null);});
        return ResponseMessage.success(transformCollectionEntityToDto(newCollection));
    }

    @PreAuthorize(value = "hasRole('user') or hasRole('admin')")
    @GetMapping("/{collectionId}")     // URL: localhost:8080/api/collection/{collectionId}  method: GET
    public ResponseMessage<MusicCollectionDtoDetail> getCollection(@PathVariable Integer collectionId) {
        MusicCollectionDtoDetail musicCollectionDetailDto = musicCollectionService.getCollectionByCollectionId(collectionId);
        musicCollectionDetailDto.getUser().setPassword(null);
        return ResponseMessage.success(musicCollectionDetailDto);
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userId")
    @GetMapping("/history/{userId}")     // URL: localhost:8080/api/collection/history/{userId}  method: GET
    public ResponseMessage<MusicCollectionDtoHistory> getHistoryCollection(@PathVariable Integer userId) {
        MusicCollectionDtoHistory musicCollectionDtoHistory = musicCollectionService.getHistoryCollectionByUserId(userId);
        musicCollectionDtoHistory.getUser().setPassword(null);
        return ResponseMessage.success(musicCollectionDtoHistory);
    }

    @PreAuthorize(value = "hasRole('user') or hasRole('admin')")
    @GetMapping("/batch-by-user")     // URL: localhost:8080/api/collection/batch-by-user?userId=...&searchState=...  method: GET
    public ResponseMessage<List<MusicCollectionDto>> getCollectionByUser(
            @RequestParam Integer userId,
            @RequestParam String searchState) {
        List<MusicCollectionDto> collectionList = musicCollectionService.getCollectionByUserId(userId, searchState);
        if (collectionList == null || collectionList.isEmpty()) {
            return ResponseMessage.success("歌单列表为空", null);
        }
        if(searchState.equals("private")){
            // 私有模式查看，把历史歌单去掉
            collectionList.remove(0);
        }
//        collectionList.forEach(collection -> {collection.getUser().setPassword(null);});

        return ResponseMessage.success(collectionList);
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userId")
    @GetMapping("/batch-by-user/marks")     // URL: localhost:8080/api/collection/batch-by-user/marks?userId=...  method: GET
    public ResponseMessage<List<MusicCollectionDto>> getMarkedCollectionByUser(
            @RequestParam Integer userId) {
        List<MusicCollectionDto> collectionList = musicCollectionService.getMarkedCollectionByUserId(userId);
        if (collectionList == null || collectionList.isEmpty()) {
            return ResponseMessage.success("还没有收藏的歌单哦", null);
        }
        collectionList.forEach(collection -> {collection.getUser().setPassword(null);});

        return ResponseMessage.success(collectionList);
    }

//    @PreAuthorize(value = "hasRole('user') or hasRole('admin')")
    @GetMapping("/batch")     // URL: localhost:8080/api/collection/batch?userId=...&collectionName=...&collectionGenre=...&mode=...  method: GET
    public ResponseMessage<List<MusicCollectionDto>> getCollectionBatch(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String collectionName,
            @RequestParam(required = false) String collectionGenre,
            @RequestParam(required = true) String mode) {
        List<MusicCollectionDto> collections = musicCollectionService.getCollectionBySomething(userId, collectionName, collectionGenre, mode);
        if (collections == null || collections.isEmpty()) {
            return ResponseMessage.success("歌单列表为空", null);
        }
        collections.forEach(collection -> {collection.getUser().setPassword(null);});
        return ResponseMessage.success(collections);
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #collection.userId")
    @PutMapping     // URL: localhost:8080/api/collection  method: PUT
    public ResponseMessage<MusicCollectionDto> updateCollection(@Validated @RequestBody MusicCollectionDto collection) {
        MusicCollection updatedCollection = musicCollectionService.updateCollection(collection);
        updatedCollection.getUser().setPassword(null);
//        updatedCollection.getMusics().forEach(music -> {music.getUser().setPassword(null);});
        return ResponseMessage.success(transformCollectionEntityToDto(updatedCollection));
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userId")
    @DeleteMapping("/{collectionId}/user/{userId}")     // URL: localhost:8080/api/collection/{collectionId}/user/{userId}  method: DELETE
    public ResponseMessage<Void> deleteCollection(@PathVariable Integer collectionId, @PathVariable Integer userId) {
        musicCollectionService.deleteCollectionByCollectionId(collectionId);
        return ResponseMessage.success();
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userId")
    @DeleteMapping("/batch/user/{userId}")     // URL: localhost:8080/api/collection/batch?ids=...&ids=... 等/user/{userId}  method: DELETE
    public ResponseMessage<Void> deleteCollections(@RequestParam("ids") List<Integer> collectionIds, @PathVariable Integer userId) {
        musicCollectionService.deleteCollectionByCollectionIds(collectionIds);
        return ResponseMessage.success();
    }

}
