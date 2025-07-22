package com.hanbly.ourmusic_api.pojo;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_lyric")
public class Lyric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lyric_id")
    private Integer lyricId;

    /**
     * 歌词内容
     */
    @Lob
    @Column(name = "lyric_content", columnDefinition = "TEXT")
    private String lyricContent;

    /**
     * 格式，如 LRC\TXT
     */
    @Column(name = "lyric_format")
    private String lyricFormat;

    public Lyric() {
    }

    public Integer getLyricId() {
        return lyricId;
    }

    public void setLyricId(Integer lyricId) {
        this.lyricId = lyricId;
    }

    public String getLyricContent() {
        return lyricContent;
    }

    public void setLyricContent(String lyricContent) {
        this.lyricContent = lyricContent;
    }

    public String getLyricFormat() {
        return lyricFormat;
    }

    public void setLyricFormat(String lyricFormat) {
        this.lyricFormat = lyricFormat;
    }
}
