import React, { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import axiosClient from "../../../api-config";
import { AuthContext } from "../../../context/auth-context";
import "./CommentListItem.css";

const CommentListItem = ({ comment, onReplyAdded, rootCommentId }) => {
  const auth = useContext(AuthContext);
  const isOwner = auth.userId && comment.userDto && comment.userDto.userId === auth.userId;

  // State for interactions (like, dislike, reply form)
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [isDisliked, setIsDisliked] = useState(comment.isDisliked || false);
  const [likeCount, setLikeCount] = useState(comment.commentLikedCount || 0);
  const [dislikeCount, setDislikeCount] = useState(comment.commentDislikedCount || 0);
  const [isInteracting, setIsInteracting] = useState(false);
  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (showReplyForm && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [replyText, showReplyForm]);

  const formatTime = (time) => {
    if (!time) return "";
    const truncatedTime = time.replace(/(\.\d{3})\d+/, '$1');
    return new Date(time).toLocaleString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInteraction = (actionType) => {
    if (!auth.userId) return auth.openLoginModal();
    if (isInteracting) return;
    setIsInteracting(true);

    const endpoint = `/api/data-stats/${actionType}/COMMENT/${comment.commentId}/user/${auth.userId}`;

    axiosClient.post(endpoint)
      .then(response => {
        // Optimistically update UI based on expected response messages
        if (actionType === 'like') {
          if (response.data.message === "点赞成功") {
            setIsLiked(true);
            setLikeCount(prev => prev + 1);
            if (isDisliked) {
              setIsDisliked(false);
              setDislikeCount(prev => (prev > 0 ? prev - 1 : 0));
            }
          } else { // Cancel like
            setIsLiked(false);
            setLikeCount(prev => (prev > 0 ? prev - 1 : 0));
          }
        } else if (actionType === 'dislike') {
            if (response.data.message === "点踩成功") {
                setIsDisliked(true);
                setDislikeCount(prev => prev + 1);
                if (isLiked) {
                    setIsLiked(false);
                    setLikeCount(prev => (prev > 0 ? prev - 1 : 0));
                }
            } else { // Cancel dislike
                setIsDisliked(false);
                setDislikeCount(prev => (prev > 0 ? prev - 1 : 0));
            }
        }
      })
      .catch(err => console.error(`Error with ${actionType}:`, err))
      .finally(() => setIsInteracting(false));
  };


  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setReplyError("回复内容不能为空");
      return;
    }
    setIsSubmittingReply(true);
    setReplyError("");
    
    try {
      const response = await axiosClient.post(`/api/comment`, {
        commentContent: replyText,
        commentOwnerType: "COMMENT",
        commentOwnerId: rootCommentId || comment.commentId,
        userDto: { userId: auth.userId },
        replyToUserId: comment.userDto.userId,
      });

      if (response.data && response.data.code === 200) {
        setReplyText("");
        setShowReplyForm(false);
        onReplyAdded(response.data.data, rootCommentId || comment.commentId);
      } else {
        throw new Error(response.data.message || "发布失败");
      }
    } catch (err) {
      setReplyError(err.response?.data?.message || "回复失败，请稍后再试。");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <li className="comment-item">
      <Link to={`/${comment.userDto.userId}/myMusics`}>
        <img
          src={comment.userDto.userAvatarFileUrl}
          alt={comment.userDto.userNickName || comment.userDto.userName}
          className="comment-item__avatar"
        />
      </Link>
      <div className="comment-item__content">
        <div className="comment-item__header">
          <Link to={`/${comment.userDto.userId}/myMusics`} className="comment-item__author">
            {comment.userDto.userNickName || comment.userDto.userName}
          </Link>
          {comment.replyToUserDto && (
            <span className="comment-item__reply-tag">
              {" "}回复{" "}
              <Link to={`/${comment.replyToUserDto.userId}/myMusics`}>
                @{comment.replyToUserDto.userNickName || comment.replyToUserDto.userName}
              </Link>
            </span>
          )}
          <span className="comment-item__timestamp">{formatTime(comment.commentTimestamp)}</span>
        </div>
        <p className="comment-item__text">{comment.commentContent}</p>
        <div className="comment-item__actions">
          <button className="icon-button" onClick={() => handleInteraction('like')} disabled={isInteracting}>
            {isLiked ? <BiSolidLike color="#1db954" data-liked="true" /> : <BiLike />}
            <span className="count-display">{likeCount > 0 && likeCount}</span>
          </button>
          <button className="icon-button" onClick={() => handleInteraction('dislike')} disabled={isInteracting}>
            {isDisliked ? <BiSolidDislike color="#f44336" data-disliked="true" /> : <BiDislike />}
            <span className="count-display">{dislikeCount > 0 && dislikeCount}</span>
          </button>
          <button className="text-button" onClick={() => setShowReplyForm(!showReplyForm)}>
            回复
          </button>
        </div>
        
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="reply-form">
            <textarea
              ref={textareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`回复 @${comment.userDto.userNickName || comment.userDto.userName}`}
              rows="1"
              disabled={isSubmittingReply}
            />
            <button type="submit" disabled={!replyText.trim() || isSubmittingReply}>
              {isSubmittingReply ? "发布中..." : "发布"}
            </button>
            {replyError && <p className="form-error">{replyError}</p>}
          </form>
        )}
        
        {/* ---- 核心改动：递归渲染子评论 ---- */}
        {comment.subCommentsDto && comment.subCommentsDto.length > 0 && (
          <ul className="comment-replies-list">
            {comment.subCommentsDto.map((reply) => (
              <CommentListItem
                key={reply.commentId}
                comment={reply}
                onReplyAdded={onReplyAdded}
                rootCommentId={rootCommentId || comment.commentId}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
};

export default CommentListItem;