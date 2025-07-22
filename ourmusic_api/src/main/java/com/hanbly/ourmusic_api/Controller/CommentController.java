package com.hanbly.ourmusic_api.Controller;

import com.hanbly.ourmusic_api.Service.CommentService;
import com.hanbly.ourmusic_api.pojo.Comment;
import com.hanbly.ourmusic_api.pojo.ResponseMessage;
import com.hanbly.ourmusic_api.pojo.dto.CommentDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.hanbly.ourmusic_api.Utils.TransformEntityToDto.*;

@RestController
@RequestMapping("/api/comment")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #commentDto.userDto.userId")
    @PostMapping        // URL: localhost:8080/api/comment method: POST
    public ResponseMessage<CommentDto> addComment(@RequestBody CommentDto commentDto) {
        Comment comment = commentService.addComment(commentDto);
        return ResponseMessage.success(transformCommentEntityToDto(comment));
    }

    @PreAuthorize(value = "hasRole('admin') or hasRole('user')")
    @GetMapping(value = "/{commentOwnerType}/{commentOwnerId}")        // URL: localhost:8080/api/comment/{commentOwnerType}/{commentOwnerId} method: GET
    public ResponseMessage<List<CommentDto>> getComments(@PathVariable Comment.OwnerType commentOwnerType, @PathVariable Integer commentOwnerId) {
        List<CommentDto> commentDtoList = commentService.getCommentsById(commentOwnerType, commentOwnerId);
        return ResponseMessage.success(commentDtoList);
    }

    @PreAuthorize(value = "hasRole('admin') or authentication.principal.getUserId() == #userId")
    @DeleteMapping(value = "/{commentId}/user/{userId}")        // URL: localhost:8080/api/comment/{commentId}/user/{userId} method: DELETE
    public ResponseMessage<Void> deleteComment(@PathVariable Integer commentId, @PathVariable Integer userId) {
        commentService.deleteComment(commentId);
        return ResponseMessage.success("成功删除评论");
    }

}
