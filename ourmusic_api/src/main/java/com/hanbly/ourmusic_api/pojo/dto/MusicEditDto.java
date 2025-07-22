package com.hanbly.ourmusic_api.pojo.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;

import java.util.Set;

public class MusicEditDto {

    @NotNull
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

//    @Lob
//    private String lyricContent;


    private Integer userId;


    public MusicEditDto() {
    }

    public @NotNull Integer getMusicId() {
        return musicId;
    }

    public void setMusicId(@NotNull Integer musicId) {
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

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}