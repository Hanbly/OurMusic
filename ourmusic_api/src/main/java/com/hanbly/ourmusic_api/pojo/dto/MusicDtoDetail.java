package com.hanbly.ourmusic_api.pojo.dto;

import com.hanbly.ourmusic_api.pojo.RBAC.RBACdto.UserDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;

import java.util.List;

public class MusicDtoDetail {

    private Integer musicId;

    @NotBlank(message = "音乐名称不能为空")
    private String musicName;

    private String musicAlbum;

    @NotBlank(message = "音乐作家不能为空")
    private String musicArtist;

    @NotBlank(message = "音乐种类不能为空")
    private String musicGenre;

    @NotBlank(message = "音乐年份不能为空")
    @Length(min = 4, max = 4)
    private String musicYear;

    private Integer musicImageFileId;

    private String musicImageFileUrl;

    @NotNull(message = "音乐文件id不能为空")
    private Integer musicFileId;

    @NotBlank(message = "音乐url不能为空")
    private String musicFileUrl;

    private Integer musicLikedCount;
    private Integer musicDislikedCount;
    private Integer musicSharedCount;
    private Integer musicCommentedCount;
    private Integer musicCollectedCount;
    private Integer musicDownloadCount;

    private List<CommentDto> commentsDto;

    private UserDto userDto;


    public MusicDtoDetail() {
    }

    public Integer getMusicId() {
        return musicId;
    }

    public void setMusicId(Integer musicId) {
        this.musicId = musicId;
    }

    public @NotBlank(message = "音乐名称不能为空") String getMusicName() {
        return musicName;
    }

    public void setMusicName(@NotBlank(message = "音乐名称不能为空") String musicName) {
        this.musicName = musicName;
    }

    public String getMusicAlbum() {
        return musicAlbum;
    }

    public void setMusicAlbum(String musicAlbum) {
        this.musicAlbum = musicAlbum;
    }

    public @NotBlank(message = "音乐作家不能为空") String getMusicArtist() {
        return musicArtist;
    }

    public void setMusicArtist(@NotBlank(message = "音乐作家不能为空") String musicArtist) {
        this.musicArtist = musicArtist;
    }

    public @NotBlank(message = "音乐种类不能为空") String getMusicGenre() {
        return musicGenre;
    }

    public void setMusicGenre(@NotBlank(message = "音乐种类不能为空") String musicGenre) {
        this.musicGenre = musicGenre;
    }

    public @NotBlank(message = "音乐年份不能为空") @Length(min = 4, max = 4) String getMusicYear() {
        return musicYear;
    }

    public void setMusicYear(@NotBlank(message = "音乐年份不能为空") @Length(min = 4, max = 4) String musicYear) {
        this.musicYear = musicYear;
    }

    public Integer getMusicImageFileId() {
        return musicImageFileId;
    }

    public void setMusicImageFileId(Integer musicImageFileId) {
        this.musicImageFileId = musicImageFileId;
    }

    public String getMusicImageFileUrl() {
        return musicImageFileUrl;
    }

    public void setMusicImageFileUrl(String musicImageFileUrl) {
        this.musicImageFileUrl = musicImageFileUrl;
    }

    public @NotNull(message = "音乐文件id不能为空") Integer getMusicFileId() {
        return musicFileId;
    }

    public void setMusicFileId(@NotNull(message = "音乐文件id不能为空") Integer musicFileId) {
        this.musicFileId = musicFileId;
    }

    public @NotBlank(message = "音乐url不能为空") String getMusicFileUrl() {
        return musicFileUrl;
    }

    public void setMusicFileUrl(@NotBlank(message = "音乐url不能为空") String musicFileUrl) {
        this.musicFileUrl = musicFileUrl;
    }

    public Integer getMusicLikedCount() {
        return musicLikedCount;
    }

    public void setMusicLikedCount(Integer musicLikedCount) {
        this.musicLikedCount = musicLikedCount;
    }

    public Integer getMusicDislikedCount() {
        return musicDislikedCount;
    }

    public void setMusicDislikedCount(Integer musicDislikedCount) {
        this.musicDislikedCount = musicDislikedCount;
    }

    public Integer getMusicSharedCount() {
        return musicSharedCount;
    }

    public void setMusicSharedCount(Integer musicSharedCount) {
        this.musicSharedCount = musicSharedCount;
    }

    public Integer getMusicCommentedCount() {
        return musicCommentedCount;
    }

    public void setMusicCommentedCount(Integer musicCommentedCount) {
        this.musicCommentedCount = musicCommentedCount;
    }

    public Integer getMusicCollectedCount() {
        return musicCollectedCount;
    }

    public void setMusicCollectedCount(Integer musicCollectedCount) {
        this.musicCollectedCount = musicCollectedCount;
    }

    public Integer getMusicDownloadCount() {
        return musicDownloadCount;
    }

    public void setMusicDownloadCount(Integer musicDownloadCount) {
        this.musicDownloadCount = musicDownloadCount;
    }

    public List<CommentDto> getCommentsDto() {
        return commentsDto;
    }

    public void setCommentsDto(List<CommentDto> commentsDto) {
        this.commentsDto = commentsDto;
    }

    public UserDto getUserDto() {
        return userDto;
    }

    public void setUserDto(UserDto userDto) {
        this.userDto = userDto;
    }
}