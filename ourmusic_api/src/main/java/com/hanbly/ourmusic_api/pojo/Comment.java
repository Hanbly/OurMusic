package com.hanbly.ourmusic_api.pojo;

import com.hanbly.ourmusic_api.pojo.RBAC.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "tb_comment", indexes = {
        @Index(name = "idx_owner", columnList = "comment_owner_type, comment_owner_id"),
        @Index(name = "idx_user", columnList = "user_id")
})
public class Comment {
    public enum OwnerType{
        USER,
        MUSIC,
        COLLECTION,
        COMMENT
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Integer commentId;

    @Lob
    @Column(name = "comment_content", columnDefinition = "TEXT")
    private String commentContent;

    @Column(name = "comment_timestamp")
    private Instant commentTimestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "comment_owner_type")
    private OwnerType commentOwnerType;

    @JoinColumn(name = "comment_owner_id")
    private Integer commentOwnerId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "reply_to_user_id")
    Integer replyToUserId;


    public Comment() {
    }

    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
    }

    public String getCommentContent() {
        return commentContent;
    }

    public void setCommentContent(String commentContent) {
        this.commentContent = commentContent;
    }

    public Instant getCommentTimestamp() {
        return commentTimestamp;
    }

    public void setCommentTimestamp(Instant commentTimestamp) {
        this.commentTimestamp = commentTimestamp;
    }

//    public Integer getCommentLikedCount() {
//        return commentLikedCount;
//    }
//
//    public void setCommentLikedCount(Integer commentLikedCount) {
//        this.commentLikedCount = commentLikedCount;
//    }


    public OwnerType getCommentOwnerType() {
        return commentOwnerType;
    }

    public void setCommentOwnerType(OwnerType commentOwnerType) {
        this.commentOwnerType = commentOwnerType;
    }

    public Integer getCommentOwnerId() {
        return commentOwnerId;
    }

    public void setCommentOwnerId(Integer commentOwnerId) {
        this.commentOwnerId = commentOwnerId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getReplyToUserId() {
        return replyToUserId;
    }

    public void setReplyToUserId(Integer replyToUserId) {
        this.replyToUserId = replyToUserId;
    }
}
