package com.hanbly.ourmusic_api.Service;

import com.hanbly.ourmusic_api.pojo.Comment;
import com.hanbly.ourmusic_api.pojo.dto.CommentDto;

import java.util.List;

public interface CommentService {
    Comment addComment(CommentDto commentDto);

//    List<CommentDto> getCommentsByMusicId(Integer musicId);
//
//    List<CommentDto> getCommentsByUserId(Integer userId);

    List<CommentDto> getCommentsById(Comment.OwnerType commentOwnerType, Integer commentOwnerId);

    void deleteComment(Integer commentId);
}
