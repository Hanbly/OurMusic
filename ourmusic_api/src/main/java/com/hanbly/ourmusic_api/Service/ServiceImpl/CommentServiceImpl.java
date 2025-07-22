package com.hanbly.ourmusic_api.Service.ServiceImpl;

import com.hanbly.ourmusic_api.Dao.CommentDao;
import com.hanbly.ourmusic_api.Dao.DataStats.CommentStatsDao;
import com.hanbly.ourmusic_api.Dao.DataStats.DislikeDao;
import com.hanbly.ourmusic_api.Dao.DataStats.LikeDao;
import com.hanbly.ourmusic_api.Dao.MusicDao;
import com.hanbly.ourmusic_api.Dao.UserDao;
import com.hanbly.ourmusic_api.Service.CommentService;
import com.hanbly.ourmusic_api.Utils.TransformEntityToDto;
import com.hanbly.ourmusic_api.pojo.Comment;
import com.hanbly.ourmusic_api.pojo.DataStats.CommentStats;
import com.hanbly.ourmusic_api.pojo.DataStats.Dislike;
import com.hanbly.ourmusic_api.pojo.DataStats.Like;
import com.hanbly.ourmusic_api.pojo.RBAC.User;
import com.hanbly.ourmusic_api.pojo.dto.CommentDto;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Service
@Transactional
public class CommentServiceImpl implements CommentService {
    private final CommentDao commentDao;
    private final UserDao userDao;
    private final LikeDao likeDao;
    private final DislikeDao dislikeDao;
    private final CommentStatsDao commentStatsDao;

    public CommentServiceImpl(CommentDao commentDao, MusicDao musicDao, UserDao userDao, LikeDao likeDao, DislikeDao dislikeDao, CommentStatsDao commentStatsDao) {
        this.commentDao = commentDao;
        this.userDao = userDao;
        this.likeDao = likeDao;
        this.dislikeDao = dislikeDao;
        this.commentStatsDao = commentStatsDao;
    }

    @Override
    public Comment addComment(CommentDto commentDto) {
        Comment commentPojo = new Comment();
        if(commentDto.getCommentId() != null){
            throw new IllegalArgumentException("参数不合法，请检查！");
        }
        // 设置评论内容
        commentPojo.setCommentContent(commentDto.getCommentContent());
        // 设置评论时间
        Instant timestamp = Instant.now();
        commentPojo.setCommentTimestamp(timestamp);
        // 设置评论所属对象
        commentPojo.setCommentOwnerType(commentDto.getCommentOwnerType());
        commentPojo.setCommentOwnerId(commentDto.getCommentOwnerId());
        // 设置回复用户
        if(commentDto.getReplyToUserId() != null && userDao.existsById(commentDto.getReplyToUserId())){
            commentPojo.setReplyToUserId(commentDto.getReplyToUserId());
        }

        if(commentDto.getUserDto().getUserId() == null){
            throw new IllegalArgumentException("参数不合法，请检查！");
        }
        // 获取用户
        User user = userDao.findById(commentDto.getUserDto().getUserId())
                .orElseThrow(() -> new EntityNotFoundException("无法查询该用户"));
        commentPojo.setUser(user);
//        // 尝试获取子评论格式
//        if(commentPojo.getCommentOwnerType() != null && commentPojo.getCommentOwnerType() == Comment.OwnerType.COMMENT){
//            commentPojo.setCommentContent(" @" + commentPojo.getUser().getUserName() + " " + commentPojo.getCommentContent());
//        }
        // 先保存
        Comment commentSaved = commentDao.save(commentPojo);
        // 处理统计数据
        CommentStats.OwnerType commentStatsOwnerType = CommentStats.OwnerType.valueOf(commentSaved.getCommentOwnerType().name());
        CommentStats commentStats = new CommentStats(commentStatsOwnerType, commentSaved.getCommentOwnerId(), user);
        commentStatsDao.save(commentStats);

        return commentSaved;
    }

    @Override
    public List<CommentDto> getCommentsById(Comment.OwnerType commentOwnerType, Integer commentOwnerId) {
        List<Comment> comments = commentDao.findAllByCommentOwnerTypeAndCommentOwnerId(commentOwnerType, commentOwnerId);
        if(comments == null || comments.isEmpty()){
            return new ArrayList<>();
        }
        List<CommentDto> commentDtoList = TransformEntityToDto.transformCommentEntityListToDtoList(comments);
        commentDtoList.forEach(commentDto -> {
            commentDto.setCommentLikedCount(likeDao.countAllByLikeOwnerTypeAndLikeOwnerId(Like.OwnerType.COMMENT, commentDto.getCommentId()));
            commentDto.setCommentDislikedCount(dislikeDao.countAllByDislikeOwnerTypeAndDislikeOwnerId(Dislike.OwnerType.COMMENT, commentDto.getCommentId()));
        });
        return commentDtoList;
    }

//    @Override
//    public List<CommentDto> getCommentsByMusicId(Integer musicId) {
//        List<Comment> commentsPojo = commentDao.findAllByMusicMusicId(musicId);
//        if(commentsPojo.isEmpty()){
//            return new ArrayList<>();
//        }
//        List<CommentDto> commentsDto = transformCommentEntityListToDtoList(commentsPojo);
//        commentsDto.forEach(commentDto -> {
//            commentDto.setCommentLikedCount(likeDao.countAllByLikeOwnerTypeAndLikeOwnerId(Like.OwnerType.COMMENT, commentDto.getCommentId()));
//            commentDto.setCommentDislikedCount(dislikeDao.countAllByDislikeOwnerTypeAndDislikeOwnerId(Dislike.OwnerType.COMMENT, commentDto.getCommentId()));
//        });
//        return commentsDto;
//    }
//
//    @Override
//    public List<CommentDto> getCommentsByUserId(Integer userId) {
//        List<Comment> commentsPojo = commentDao.findAllByUser_UserId(userId);
//        if(commentsPojo.isEmpty()){
//            return new ArrayList<>();
//        }
//        List<CommentDto> commentsDto = transformCommentEntityListToDtoList(commentsPojo);
//        commentsDto.forEach(commentDto -> {
//            commentDto.setCommentLikedCount(likeDao.countAllByLikeOwnerTypeAndLikeOwnerId(Like.OwnerType.COMMENT, commentDto.getCommentId()));
//            commentDto.setCommentDislikedCount(dislikeDao.countAllByDislikeOwnerTypeAndDislikeOwnerId(Dislike.OwnerType.COMMENT, commentDto.getCommentId()));
//        });
//        return commentsDto;
//    }

    @Override
    public void deleteComment(Integer commentId) {
        commentDao.deleteById(commentId);
    }
}
