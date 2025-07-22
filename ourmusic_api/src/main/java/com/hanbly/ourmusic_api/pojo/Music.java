package com.hanbly.ourmusic_api.pojo;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.sql.Time;
import java.util.Set;

@Table(name = "tb_music")
@Entity
public class Music {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "music_id")
    private Integer musicId;
    @Column(name = "music_name")
    private String musicName;
    @Column(name = "music_album")
    private String musicAlbum;
    @Column(name = "music_artist")
    private String musicArtist;
    @Column(name = "music_genre")
    private String musicGenre;
    @Column(name = "music_year")
    private String musicYear;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "music_image_file_id")
    private CustomFile musicImageFile;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "music_file_id")
    private CustomFile musicFile;

    @Column(name = "music_during")
    private Long musicDuring;

//    @Column(name = "music_liked_count", nullable = false, columnDefinition = "INT DEFAULT 0")
//    private Integer musicLikedCount;
//
//    @Column(name = "music_disliked_count", nullable = false, columnDefinition = "INT DEFAULT 0")
//    private Integer musicDislikedCount;
//    @Column(name = "music_shared_count", nullable = false, columnDefinition = "INT DEFAULT 0")
//    private Integer musicSharedCount;
//    @Column(name = "music_commented_count", nullable = false, columnDefinition = "INT DEFAULT 0")
//    private Integer musicCommentedCount;
//    @Column(name = "music_collected_count", nullable = false, columnDefinition = "INT DEFAULT 0")
//    private Integer musicCollectedCount;

    /**
     * Music表产生一个外键 lyric_id
     */
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "lyric_id")
    private Lyric lyric;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    // 'musics' 是 MusicCollection 实体中定义的集合属性名
    @ManyToMany(mappedBy = "musics")
    @JsonBackReference
    private Set<MusicCollection> musicCollection;


    public Integer getMusicId() {
        return musicId;
    }

    public void setMusicId(Integer musicId) {
        this.musicId = musicId;
    }

    public String getMusicName() {
        return musicName;
    }

    public void setMusicName(String musicName) {
        this.musicName = musicName;
    }

    public String getMusicAlbum() {
        return musicAlbum;
    }

    public void setMusicAlbum(String musicAlbum) {
        this.musicAlbum = musicAlbum;
    }

    public String getMusicArtist() {
        return musicArtist;
    }

    public void setMusicArtist(String musicArtist) {
        this.musicArtist = musicArtist;
    }

    public String getMusicGenre() {
        return musicGenre;
    }

    public void setMusicGenre(String musicGenre) {
        this.musicGenre = musicGenre;
    }

    public String getMusicYear() {
        return musicYear;
    }

    public void setMusicYear(String musicYear) {
        this.musicYear = musicYear;
    }

    public CustomFile getMusicFile() {
        return musicFile;
    }

    public void setMusicFile(CustomFile musicFile) {
        this.musicFile = musicFile;
    }

    public Long getMusicDuring() {
        return musicDuring;
    }

    public void setMusicDuring(Long musicDuring) {
        this.musicDuring = musicDuring;
    }

    public CustomFile getMusicImageFile() {
        return musicImageFile;
    }

    public void setMusicImageFile(CustomFile musicImageFile) {
        this.musicImageFile = musicImageFile;
    }

//    public Integer getMusicLikedCount() {
//        return musicLikedCount;
//    }
//
//    public void setMusicLikedCount(Integer musicLikedCount) {
//        this.musicLikedCount = musicLikedCount;
//    }
//
//    public Integer getMusicDislikedCount() {
//        return musicDislikedCount;
//    }
//
//    public void setMusicDislikedCount(Integer musicDislikedCount) {
//        this.musicDislikedCount = musicDislikedCount;
//    }
//
//    public Integer getMusicSharedCount() {
//        return musicSharedCount;
//    }
//
//    public void setMusicSharedCount(Integer musicSharedCount) {
//        this.musicSharedCount = musicSharedCount;
//    }
//
//    public Integer getMusicCommentedCount() {
//        return musicCommentedCount;
//    }
//
//    public void setMusicCommentedCount(Integer musicCommentedCount) {
//        this.musicCommentedCount = musicCommentedCount;
//    }
//
//    public Integer getMusicCollectedCount() {
//        return musicCollectedCount;
//    }
//
//    public void setMusicCollectedCount(Integer musicCollectedCount) {
//        this.musicCollectedCount = musicCollectedCount;
//    }

    public Lyric getLyric() {
        return lyric;
    }

    public void setLyric(Lyric lyric) {
        this.lyric = lyric;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Set<MusicCollection> getMusicCollection() {
        return musicCollection;
    }

    public void setMusicCollection(Set<MusicCollection> musicCollection) {
        this.musicCollection = musicCollection;
    }
}
