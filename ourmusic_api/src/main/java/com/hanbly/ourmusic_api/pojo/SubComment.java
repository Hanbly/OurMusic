//package com.hanbly.ourmusic_api.pojo;
//
//import com.hanbly.ourmusic_api.pojo.RBAC.User;
//import jakarta.persistence.*;
//
//import java.time.Instant;
//
//@Entity
//@Table(name = "tb_comment", indexes = {
//        @Index(name = "idx_owner", columnList = "sub_comment_owner_type, sub_comment_owner_id"),
//        @Index(name = "idx_user", columnList = "user_id"),
//        @Index(name = "idx_comment", columnList = "comment_id")
//})
//public class SubComment {
//    public enum OwnerType{
//        COMMENT
//    }
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "sub_comment_id")
//    private Integer subCommentId;
//
//    @Lob
//    @Column(name = "sub_comment_content", columnDefinition = "TEXT")
//    private String subCommentContent;
//
//    @Column(name = "sub_comment_timestamp")
//    private Instant subCommentTimestamp;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "sub_comment_owner_type")
//    private OwnerType subCommentOwnerType;
//
//    @JoinColumn(name = "sub_comment_owner_id")
//    private Integer subCommentOwnerId;
//
//    @ManyToOne
//    @JoinColumn(name = "user_id")
//    private User user;
//
//    @ManyToOne
//    @JoinColumn(name = "comment_id")
//    private Comment comment;
//
//    public SubComment() {
//    }
//
//    public Integer getSubCommentId() {
//        return subCommentId;
//    }
//
//    public void setSubCommentId(Integer subCommentId) {
//        this.subCommentId = subCommentId;
//    }
//
//    public String getSubCommentContent() {
//        return subCommentContent;
//    }
//
//    public void setSubCommentContent(String subCommentContent) {
//        this.subCommentContent = subCommentContent;
//    }
//
//    public Instant getSubCommentTimestamp() {
//        return subCommentTimestamp;
//    }
//
//    public void setSubCommentTimestamp(Instant subCommentTimestamp) {
//        this.subCommentTimestamp = subCommentTimestamp;
//    }
//
//    public OwnerType getSubCommentOwnerType() {
//        return subCommentOwnerType;
//    }
//
//    public void setSubCommentOwnerType(OwnerType subCommentOwnerType) {
//        this.subCommentOwnerType = subCommentOwnerType;
//    }
//
//    public Integer getSubCommentOwnerId() {
//        return subCommentOwnerId;
//    }
//
//    public void setSubCommentOwnerId(Integer subCommentOwnerId) {
//        this.subCommentOwnerId = subCommentOwnerId;
//    }
//
//    public User getUser() {
//        return user;
//    }
//
//    public void setUser(User user) {
//        this.user = user;
//    }
//
//    public Comment getComment() {
//        return comment;
//    }
//
//    public void setComment(Comment comment) {
//        this.comment = comment;
//    }
//}
