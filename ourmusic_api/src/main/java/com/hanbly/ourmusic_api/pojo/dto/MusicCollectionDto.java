package com.hanbly.ourmusic_api.pojo.dto;

import com.hanbly.ourmusic_api.pojo.RBAC.RBACdto.UserDto;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class MusicCollectionDto {

    private Integer collectionId;

    @NotBlank(message = "歌单名不能为空")
    private String collectionName;

    private Integer collectionImageFileId;

    private String collectionImageFileUrl;

    private String collectionDescription;

    @NotBlank(message = "歌单风格不能为空")
    private String collectionGenre;

    @NotBlank(message = "歌单公开状态不能为空")
    private String collectionStatus;

    private Integer collectionMusicsNumber;
    private Integer collectionLikedCount;
    private Integer collectionDislikedCount;
    private Integer collectionSharedCount;
    private Integer collectionCollectedCount;
    private Integer collectionCommentedCount;

    private Integer userId;

    private UserDto user;

    private Boolean operateUserCollectedOrNot;
    private Boolean operateUserLikedOrNot;
    private Boolean operateUserDislikedOrNot;

    private Boolean musicCollectedOrNot;

    private List<MusicDto> musics;


    public MusicCollectionDto() {
    }

    public MusicCollectionDto(
            String collectionName, Integer collectionImageFileId, String collectionDescription,
            String collectionStatus, Integer userId, List<MusicDto> musics) {
        this.collectionName = collectionName;
        this.collectionImageFileId = collectionImageFileId;
        this.collectionDescription = collectionDescription;
        this.collectionStatus = collectionStatus;
        this.userId = userId;
        this.musics = musics;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public List<MusicDto> getMusics() {
        return musics;
    }

    public void setMusics(List<MusicDto> musics) {
        this.musics = musics;
    }

    public Integer getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(Integer collectionId) {
        this.collectionId = collectionId;
    }

    public @NotBlank(message = "歌单名不能为空") String getCollectionName() {
        return collectionName;
    }

    public void setCollectionName(@NotBlank(message = "歌单名不能为空") String collectionName) {
        this.collectionName = collectionName;
    }

    public Integer getCollectionImageFileId() {
        return collectionImageFileId;
    }

    public void setCollectionImageFileId(Integer collectionImageFileId) {
        this.collectionImageFileId = collectionImageFileId;
    }

    public String getCollectionImageFileUrl() {
        return collectionImageFileUrl;
    }

    public void setCollectionImageFileUrl(String collectionImageFileUrl) {
        this.collectionImageFileUrl = collectionImageFileUrl;
    }

    public String getCollectionDescription() {
        return collectionDescription;
    }

    public void setCollectionDescription(String collectionDescription) {
        this.collectionDescription = collectionDescription;
    }

    public @NotBlank(message = "歌单风格不能为空") String getCollectionGenre() {
        return collectionGenre;
    }

    public void setCollectionGenre(@NotBlank(message = "歌单风格不能为空") String collectionGenre) {
        this.collectionGenre = collectionGenre;
    }

    public @NotBlank(message = "歌单公开状态不能为空") String getCollectionStatus() {
        return collectionStatus;
    }

    public void setCollectionStatus(@NotBlank(message = "歌单公开状态不能为空") String collectionStatus) {
        this.collectionStatus = collectionStatus;
    }

    public Integer getCollectionMusicsNumber() {
        return collectionMusicsNumber;
    }

    public void setCollectionMusicsNumber(Integer collectionMusicsNumber) {
        this.collectionMusicsNumber = collectionMusicsNumber;
    }

    public Integer getCollectionLikedCount() {
        return collectionLikedCount;
    }

    public void setCollectionLikedCount(Integer collectionLikedCount) {
        this.collectionLikedCount = collectionLikedCount;
    }

    public Integer getCollectionDislikedCount() {
        return collectionDislikedCount;
    }

    public void setCollectionDislikedCount(Integer collectionDislikedCount) {
        this.collectionDislikedCount = collectionDislikedCount;
    }

    public Integer getCollectionSharedCount() {
        return collectionSharedCount;
    }

    public void setCollectionSharedCount(Integer collectionSharedCount) {
        this.collectionSharedCount = collectionSharedCount;
    }

    public Integer getCollectionCollectedCount() {
        return collectionCollectedCount;
    }

    public void setCollectionCollectedCount(Integer collectionCollectedCount) {
        this.collectionCollectedCount = collectionCollectedCount;
    }

    public Integer getCollectionCommentedCount() {
        return collectionCommentedCount;
    }

    public void setCollectionCommentedCount(Integer collectionCommentedCount) {
        this.collectionCommentedCount = collectionCommentedCount;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Boolean getOperateUserCollectedOrNot() {
        return operateUserCollectedOrNot;
    }

    public void setOperateUserCollectedOrNot(Boolean operateUserCollectedOrNot) {
        this.operateUserCollectedOrNot = operateUserCollectedOrNot;
    }

    public Boolean getOperateUserLikedOrNot() {
        return operateUserLikedOrNot;
    }

    public void setOperateUserLikedOrNot(Boolean operateUserLikedOrNot) {
        this.operateUserLikedOrNot = operateUserLikedOrNot;
    }

    public Boolean getOperateUserDislikedOrNot() {
        return operateUserDislikedOrNot;
    }

    public void setOperateUserDislikedOrNot(Boolean operateUserDislikedOrNot) {
        this.operateUserDislikedOrNot = operateUserDislikedOrNot;
    }

    public Boolean getMusicCollectedOrNot() {
        return musicCollectedOrNot;
    }

    public void setMusicCollectedOrNot(Boolean musicCollectedOrNot) {
        this.musicCollectedOrNot = musicCollectedOrNot;
    }
}
