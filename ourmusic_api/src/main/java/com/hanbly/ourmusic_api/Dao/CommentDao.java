package com.hanbly.ourmusic_api.Dao;

import com.hanbly.ourmusic_api.pojo.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentDao extends JpaRepository<Comment, Integer>, JpaSpecificationExecutor<Comment> {

    List<Comment> findAllByUser_UserId(Integer userId);

    List<Comment> findAllByCommentOwnerTypeAndCommentOwnerId(Comment.OwnerType commentOwnerType, Integer commentOwnerId);

    List<Comment> findAllByCommentOwnerTypeAndCommentOwnerIdIn(Comment.OwnerType commentOwnerType, List<Integer> commentOwnerIds);

}
