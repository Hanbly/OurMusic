package com.hanbly.ourmusic_api.pojo.dto;

import com.hanbly.ourmusic_api.pojo.Comment;
import com.hanbly.ourmusic_api.pojo.RBAC.RBACdto.UserDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

public class CommentDto {

    private Integer commentId;

    @NotBlank
    private String commentContent;

    private Instant commentTimestamp;

    private Integer commentLikedCount;

    private Integer commentDislikedCount;

    @NotNull
    private Comment.OwnerType commentOwnerType;
    @NotNull
    private Integer commentOwnerId;

    @NotNull
    private UserDto userDto;

    private Integer replyToUserId;

    private List<SubCommentDto> subCommentsDto;

    private Boolean operateUserLikedOrNot;
    private Boolean operateUserDislikedOrNot;

    public CommentDto() {
    }

    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
    }

    public @NotBlank String getCommentContent() {
        return commentContent;
    }

    public void setCommentContent(@NotBlank String commentContent) {
        this.commentContent = commentContent;
    }

    public Instant getCommentTimestamp() {
        return commentTimestamp;
    }

    public void setCommentTimestamp(Instant commentTimestamp) {
        this.commentTimestamp = commentTimestamp;
    }

    public Integer getCommentLikedCount() {
        return commentLikedCount;
    }

    public void setCommentLikedCount(Integer commentLikedCount) {
        this.commentLikedCount = commentLikedCount;
    }

    public Integer getCommentDislikedCount() {
        return commentDislikedCount;
    }

    public void setCommentDislikedCount(Integer commentDislikedCount) {
        this.commentDislikedCount = commentDislikedCount;
    }

    public Comment.OwnerType getCommentOwnerType() {
        return commentOwnerType;
    }

    public void setCommentOwnerType(Comment.OwnerType commentOwnerType) {
        this.commentOwnerType = commentOwnerType;
    }

    public Integer getCommentOwnerId() {
        return commentOwnerId;
    }

    public void setCommentOwnerId(Integer commentOwnerId) {
        this.commentOwnerId = commentOwnerId;
    }

    public UserDto getUserDto() {
        return userDto;
    }

    public void setUserDto(UserDto userDto) {
        this.userDto = userDto;
    }

    public Integer getReplyToUserId() {
        return replyToUserId;
    }

    public void setReplyToUserId(Integer replyToUserId) {
        this.replyToUserId = replyToUserId;
    }

    public List<SubCommentDto> getSubCommentsDto() {
        return subCommentsDto;
    }

    public void setSubCommentsDto(List<SubCommentDto> subCommentsDto) {
        this.subCommentsDto = subCommentsDto;
    }

    public Boolean getOperateUserLikedOrNot() {
        return operateUserLikedOrNot;
    }

    public void setOperateUserLikedOrNot(Boolean operateUserLikedOrNot) {
        this.operateUserLikedOrNot = operateUserLikedOrNot;
    }

    public Boolean getOperateUserDislikedOrNot() {
        return operateUserDislikedOrNot;
    }

    public void setOperateUserDislikedOrNot(Boolean operateUserDislikedOrNot) {
        this.operateUserDislikedOrNot = operateUserDislikedOrNot;
    }
}
