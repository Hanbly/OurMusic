package com.hanbly.ourmusic_api.pojo.DataStats;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_like", indexes = {
        @Index(name = "idx_owner", columnList = "like_owner_type, like_owner_id"),
        @Index(name = "idx_user", columnList = "like_did_user_id")
})
public class Like {
    public enum OwnerType { USER, MUSIC, COLLECTION, COMMENT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Integer likeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "like_owner_type")
    private OwnerType likeOwnerType;

    @Column(name = "like_owner_id")
    private Integer likeOwnerId;

    @ManyToOne // 关联用户实体示例
    @JoinColumn(name = "like_did_user_id")
    private User likedByUser;

    @Column(name = "like_timestamp")
    private Instant likeTimestamp;

    public Like() {
    }

    public Like(OwnerType likeOwnerType, Integer likeOwnerId, User likedByUser) {
        this.likeOwnerType = likeOwnerType;
        this.likeOwnerId = likeOwnerId;
        this.likedByUser = likedByUser;
        this.likeTimestamp = Instant.now();
    }

    public Integer getLikeId() {
        return likeId;
    }

    public void setLikeId(Integer likeId) {
        this.likeId = likeId;
    }

    public OwnerType getLikeOwnerType() {
        return likeOwnerType;
    }

    public void setLikeOwnerType(OwnerType likeOwnerType) {
        this.likeOwnerType = likeOwnerType;
    }

    public Integer getLikeOwnerId() {
        return likeOwnerId;
    }

    public void setLikeOwnerId(Integer likeOwnerId) {
        this.likeOwnerId = likeOwnerId;
    }

    public User getLikedByUser() {
        return likedByUser;
    }

    public void setLikedByUser(User likedByUser) {
        this.likedByUser = likedByUser;
    }

    public Instant getLikeTimestamp() {
        return likeTimestamp;
    }

    public void setLikeTimestamp(Instant likeTimestamp) {
        this.likeTimestamp = likeTimestamp;
    }
}