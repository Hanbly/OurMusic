package com.hanbly.ourmusic_api.pojo;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.util.List;
import java.util.Set;


@Entity
@Table(name = "tb_musiccollection")
public class MusicCollection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "collection_id")
    private Integer collectionId;

    @Column(name = "collection_name")
    private String collectionName;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "collection_image_file_id")
    private CustomFile collectionImageFile;

    @Column(name = "collection_description")
    private String collectionDescription;

    @Column(name = "collection_genre")
    private String collectionGenre;

    @Enumerated(EnumType.STRING)
    @Column(name = "collection_status")
    private CollectionStatus collectionStatus;
    public enum CollectionStatus {
        PRIVATE,
        PUBLIC
    }

//    @Column(name = "collection_musics_number", nullable = false, columnDefinition = "INT DEFAULT 0")
//    private Integer collectionMusicsNumber;
//
//    @Column(name = "collection_liked_count", nullable = false, columnDefinition = "INT DEFAULT 0")
//    private Integer collectionLikedCount;
//    @Column(name = "collection_disliked_count", nullable = false, columnDefinition = "INT DEFAULT 0")
//    private Integer collectionDislikedCount;
//    @Column(name = "collection_shared_count", nullable = false, columnDefinition = "INT DEFAULT 0")
//    private Integer collectionSharedCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    // 'markedUsers' 是 User 实体中定义的集合属性名
    @ManyToMany(mappedBy = "markedCollections")
    @JsonBackReference
    private Set<User> markedUsers;

    @ManyToMany
    @JoinTable(
            name = "playlist_music_link", // 中间表的名字
            joinColumns = @JoinColumn(name = "collection_id"), // 中间表中指向自己的外键
            inverseJoinColumns = @JoinColumn(name = "music_id") // 中间表中指向对方的外键
    )
    @JsonManagedReference
    private List<Music> musics;

    public MusicCollection() {}


    public Integer getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(Integer collectionId) {
        this.collectionId = collectionId;
    }

    public String getCollectionName() {
        return collectionName;
    }

    public void setCollectionName(String collectionName) {
        this.collectionName = collectionName;
    }

    public CustomFile getCollectionImageFile() {
        return collectionImageFile;
    }

    public void setCollectionImageFile(CustomFile collectionImageFile) {
        this.collectionImageFile = collectionImageFile;
    }

    public String getCollectionDescription() {
        return collectionDescription;
    }

    public void setCollectionDescription(String collectionDescription) {
        this.collectionDescription = collectionDescription;
    }

    public String getCollectionGenre() {
        return collectionGenre;
    }

    public void setCollectionGenre(String collectionGenre) {
        this.collectionGenre = collectionGenre;
    }

    public CollectionStatus getCollectionStatus() {
        return collectionStatus;
    }

    public void setCollectionStatus(CollectionStatus collectionStatus) {
        this.collectionStatus = collectionStatus;
    }

//    public Integer getCollectionMusicsNumber() {
//        return collectionMusicsNumber;
//    }
//
//    public void setCollectionMusicsNumber(Integer collectionMusicsNumber) {
//        this.collectionMusicsNumber = collectionMusicsNumber;
//    }
//
//    public Integer getCollectionLikedCount() {
//        return collectionLikedCount;
//    }
//
//    public void setCollectionLikedCount(Integer collectionLikedCount) {
//        this.collectionLikedCount = collectionLikedCount;
//    }
//
//    public Integer getCollectionDislikedCount() {
//        return collectionDislikedCount;
//    }
//
//    public void setCollectionDislikedCount(Integer collectionDislikedCount) {
//        this.collectionDislikedCount = collectionDislikedCount;
//    }
//
//    public Integer getCollectionSharedCount() {
//        return collectionSharedCount;
//    }
//
//    public void setCollectionSharedCount(Integer collectionSharedCount) {
//        this.collectionSharedCount = collectionSharedCount;
//    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Set<User> getMarkedUsers() {
        return markedUsers;
    }

    public void setMarkedUsers(Set<User> markedUsers) {
        this.markedUsers = markedUsers;
    }

    public List<Music> getMusics() {
        return musics;
    }

    public void setMusics(List<Music> musics) {
        this.musics = musics;
    }
}
