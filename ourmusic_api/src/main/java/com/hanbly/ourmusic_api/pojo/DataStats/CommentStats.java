package com.hanbly.ourmusic_api.pojo.DataStats;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_commentStats", indexes = {
        @Index(name = "idx_owner", columnList = "commentStats_owner_type, commentStats_owner_id"),
        @Index(name = "idx_user", columnList = "commentStats_did_user_id")
})
public class CommentStats {
    public enum OwnerType { USER, MUSIC, COLLECTION, COMMENT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "commentStats_id")
    private Integer commentStatsId;

    @Enumerated(EnumType.STRING)
    @Column(name = "commentStats_owner_type")
    private OwnerType commentStatsOwnerType;

    @Column(name = "commentStats_owner_id")
    private Integer commentStatsOwnerId;

    @ManyToOne // 关联用户实体示例
    @JoinColumn(name = "commentStats_did_user_id")
    private User commentStatsdByUser;

    @Column(name = "commentStats_timestamp")
    private Instant commentStatsTimestamp;

    public CommentStats() {
    }

    public CommentStats(OwnerType commentStatsOwnerType, Integer commentStatsOwnerId, User commentStatsdByUser) {
        this.commentStatsOwnerType = commentStatsOwnerType;
        this.commentStatsOwnerId = commentStatsOwnerId;
        this.commentStatsdByUser = commentStatsdByUser;
        this.commentStatsTimestamp = Instant.now();
    }

    public Integer getCommentStatsId() {
        return commentStatsId;
    }

    public void setCommentStatsId(Integer commentStatsId) {
        this.commentStatsId = commentStatsId;
    }

    public OwnerType getCommentStatsOwnerType() {
        return commentStatsOwnerType;
    }

    public void setCommentStatsOwnerType(OwnerType commentStatsOwnerType) {
        this.commentStatsOwnerType = commentStatsOwnerType;
    }

    public Integer getCommentStatsOwnerId() {
        return commentStatsOwnerId;
    }

    public void setCommentStatsOwnerId(Integer commentStatsOwnerId) {
        this.commentStatsOwnerId = commentStatsOwnerId;
    }

    public User getCommentStatsdByUser() {
        return commentStatsdByUser;
    }

    public void setCommentStatsdByUser(User commentStatsdByUser) {
        this.commentStatsdByUser = commentStatsdByUser;
    }

    public Instant getCommentStatsTimestamp() {
        return commentStatsTimestamp;
    }

    public void setCommentStatsTimestamp(Instant commentStatsTimestamp) {
        this.commentStatsTimestamp = commentStatsTimestamp;
    }
}