package com.hanbly.ourmusic_api.pojo.dto;

import com.hanbly.ourmusic_api.pojo.Comment;
import com.hanbly.ourmusic_api.pojo.RBAC.RBACdto.UserDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class SubCommentDto {

    private Integer subCommentId;

    @NotBlank
    private String subCommentContent;

    private Instant subCommentTimestamp;

    private Integer subCommentLikedCount;

    private Integer subCommentDislikedCount;

    @NotNull
    private Comment.OwnerType subCommentOwnerType;
    @NotNull
    private Integer subCommentOwnerId;

    @NotNull
    private UserDto userDto;

    @NotNull
    private UserDto replyToUserDto;

    public SubCommentDto() {
    }

    public Integer getSubCommentId() {
        return subCommentId;
    }

    public void setSubCommentId(Integer subCommentId) {
        this.subCommentId = subCommentId;
    }

    public @NotBlank String getSubCommentContent() {
        return subCommentContent;
    }

    public void setSubCommentContent(@NotBlank String subCommentContent) {
        this.subCommentContent = subCommentContent;
    }

    public Instant getSubCommentTimestamp() {
        return subCommentTimestamp;
    }

    public void setSubCommentTimestamp(Instant subCommentTimestamp) {
        this.subCommentTimestamp = subCommentTimestamp;
    }

    public Integer getSubCommentLikedCount() {
        return subCommentLikedCount;
    }

    public void setSubCommentLikedCount(Integer subCommentLikedCount) {
        this.subCommentLikedCount = subCommentLikedCount;
    }

    public Integer getSubCommentDislikedCount() {
        return subCommentDislikedCount;
    }

    public void setSubCommentDislikedCount(Integer subCommentDislikedCount) {
        this.subCommentDislikedCount = subCommentDislikedCount;
    }

    public @NotNull Comment.OwnerType getSubCommentOwnerType() {
        return subCommentOwnerType;
    }

    public void setSubCommentOwnerType(@NotNull Comment.OwnerType subCommentOwnerType) {
        this.subCommentOwnerType = subCommentOwnerType;
    }

    public @NotNull Integer getSubCommentOwnerId() {
        return subCommentOwnerId;
    }

    public void setSubCommentOwnerId(@NotNull Integer subCommentOwnerId) {
        this.subCommentOwnerId = subCommentOwnerId;
    }

    public @NotNull UserDto getUserDto() {
        return userDto;
    }

    public void setUserDto(@NotNull UserDto userDto) {
        this.userDto = userDto;
    }

    public @NotNull UserDto getReplyToUserDto() {
        return replyToUserDto;
    }

    public void setReplyToUserDto(@NotNull UserDto replyToUserDto) {
        this.replyToUserDto = replyToUserDto;
    }
}
