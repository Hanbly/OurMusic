package com.hanbly.ourmusic_api.pojo.DataStats.DSdto; // 替换为你的包名

import java.time.Instant;

public class MusicTimestampDto {
    private Integer musicId;
    private Instant timestamp;

    public MusicTimestampDto(Integer musicId, Instant timestamp) {
        this.musicId = musicId;
        this.timestamp = timestamp;
    }

    public Integer getMusicId() {
        return musicId;
    }

    public void setMusicId(Integer musicId) {
        this.musicId = musicId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}