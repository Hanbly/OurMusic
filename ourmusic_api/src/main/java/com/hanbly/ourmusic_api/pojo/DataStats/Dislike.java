package com.hanbly.ourmusic_api.pojo.DataStats;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_dislike", indexes = {
        @Index(name = "idx_owner", columnList = "dislike_owner_type, dislike_owner_id"),
        @Index(name = "idx_user", columnList = "dislike_did_user_id")
})
public class Dislike {
    public enum OwnerType { USER, MUSIC, COLLECTION, COMMENT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dislike_id")
    private Integer dislikeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "dislike_owner_type")
    private OwnerType dislikeOwnerType;

    @Column(name = "dislike_owner_id")
    private Integer dislikeOwnerId;

    @ManyToOne // 关联用户
    @JoinColumn(name = "dislike_did_user_id")
    private User dislikedByUser;

    @Column(name = "dislike_timestamp")
    private Instant dislikeTimestamp;

    public Dislike() {
    }

    public Dislike(OwnerType dislikeOwnerType, Integer dislikeOwnerId, User dislikedByUser) {
        this.dislikeOwnerType = dislikeOwnerType;
        this.dislikeOwnerId = dislikeOwnerId;
        this.dislikedByUser = dislikedByUser;
        this.dislikeTimestamp = Instant.now();
    }

    public Integer getDislikeId() {
        return dislikeId;
    }

    public void setDislikeId(Integer dislikeId) {
        this.dislikeId = dislikeId;
    }

    public OwnerType getDislikeOwnerType() {
        return dislikeOwnerType;
    }

    public void setDislikeOwnerType(OwnerType dislikeOwnerType) {
        this.dislikeOwnerType = dislikeOwnerType;
    }

    public Integer getDislikeOwnerId() {
        return dislikeOwnerId;
    }

    public void setDislikeOwnerId(Integer dislikeOwnerId) {
        this.dislikeOwnerId = dislikeOwnerId;
    }

    public User getDislikedByUser() {
        return dislikedByUser;
    }

    public void setDislikedByUser(User dislikedByUser) {
        this.dislikedByUser = dislikedByUser;
    }

    public Instant getDislikeTimestamp() {
        return dislikeTimestamp;
    }

    public void setDislikeTimestamp(Instant dislikeTimestamp) {
        this.dislikeTimestamp = dislikeTimestamp;
    }
}