package com.hanbly.ourmusic_api.pojo.dto;

import com.hanbly.ourmusic_api.pojo.Lyric;

import java.sql.Time;

public class FileUploadResponseDto {

    private Integer customFileId;

    private String fileUrl;

    private Long musicDuring;

    private Lyric lyric;

    public Integer getCustomFileId() {
        return customFileId;
    }

    public void setCustomFileId(Integer customFileId) {
        this.customFileId = customFileId;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Long getMusicDuring() {
        return musicDuring;
    }

    public void setMusicDuring(Long musicDuring) {
        this.musicDuring = musicDuring;
    }

    public Lyric getLyric() {
        return lyric;
    }

    public void setLyric(Lyric lyric) {
        this.lyric = lyric;
    }
}
