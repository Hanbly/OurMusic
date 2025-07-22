import React, { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";

import axiosClient from "../../../api-config";
import { AuthContext } from "../../../context/auth-context";

import "./CommentListItem.css";

const CommentListItem = ({ comment, onReplyAdded, rootCommentId }) => {
  const auth = useContext(AuthContext);
  const isOwner =
    auth.userId && comment.userDto && comment.userDto.userId === auth.userId;

  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [isDisliked, setIsDisliked] = useState(comment.isDisliked || false);
  const [likeCount, setLikeCount] = useState(comment.commentLikedCount || 0);
  const [dislikeCount, setDislikeCount] = useState(
    comment.commentDislikedCount || 0
  );
  const [isInteracting, setIsInteracting] = useState(false);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const replyTextareaRef = useRef(null);
  const commentItemRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        commentItemRef.current &&
        !commentItemRef.current.contains(event.target)
      ) {
        setShowReplyForm(false);
      }
    };

    if (showReplyForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReplyForm]);

  const handleLikeClick = () => {
    if (!auth.userId) return auth.openLoginModal();
    if (isInteracting) return;
    setIsInteracting(true);
    axiosClient
      .post(
        `/api/data-stats/like/COMMENT/${comment.commentId}/user/${auth.userId}`
      )
      .then((res) => {
        if (res.data.message === "点赞成功") {
          setIsLiked(true);
          setLikeCount((p) => p + 1);
          if (isDisliked) {
            setIsDisliked(false);
            setDislikeCount((p) => p - 1);
          }
        } else if (res.data.message === "取消点赞成功") {
          setIsLiked(false);
          setLikeCount((p) => p - 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsInteracting(false));
  };

  const handleDislikeClick = () => {
    if (!auth.userId) return auth.openLoginModal();
    if (isInteracting) return;
    setIsInteracting(true);
    axiosClient
      .post(
        `/api/data-stats/dislike/COMMENT/${comment.commentId}/user/${auth.userId}`
      )
      .then((res) => {
        if (res.data.message === "点踩成功") {
          setIsDisliked(true);
          setDislikeCount((p) => p + 1);
          if (isLiked) {
            setIsLiked(false);
            setLikeCount((p) => p - 1);
          }
        } else if (res.data.message === "取消点踩成功") {
          setIsDisliked(false);
          setDislikeCount((p) => p - 1);
        }
      })
      .catch((err) => console.error(err))
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

  useEffect(() => {
    if (showReplyForm && replyTextareaRef.current) {
      replyTextareaRef.current.focus();
    }
  }, [showReplyForm]);

  if (!comment.userDto) {
    return null;
  }

  return (
    <li className="comment-item" ref={commentItemRef}>
      <Link to={`/${comment.userDto.userId}/myMusics`}>
        <img
          src={comment.userDto.userAvatarFileUrl}
          alt={comment.userDto.userNickName?comment.userDto.userNickName:comment.userDto.userName}
          className="comment-item__avatar"
        />
      </Link>
      <div className="comment-item__content">
        <div className="comment-item__header">
          <Link
            to={`/${comment.userDto.userId}/myMusics`}
            className="comment-item__author"
          >
            {comment.userDto.userNickName?comment.userDto.userNickName:comment.userDto.userName}
          </Link>
          {comment.replyToUserDto && (
            <span className="comment-item__reply-tag">
              {" "}
              回复{" "}
              <Link to={`/${comment.replyToUserDto.userId}/myMusics`}>
                @{comment.replyToUserDto.userNickName?comment.replyToUserDto.userNickName:comment.replyToUserDto.userName}
              </Link>
            </span>
          )}
          <span className="comment-item__timestamp">
            {new Date(comment.commentTimestamp).toLocaleString()}
          </span>
        </div>
        <p className="comment-item__text">{comment.commentContent}</p>
        <div className="comment-item__actions">
          <button
            className="icon-button"
            onClick={handleLikeClick}
            disabled={isInteracting}
          >
            {isLiked ? <BiSolidLike /> : <BiLike />}
            <span className="count-display">{likeCount > 0 && likeCount}</span>
          </button>
          <button
            className="icon-button"
            onClick={handleDislikeClick}
            disabled={isInteracting}
          >
            {isDisliked ? <BiSolidDislike /> : <BiDislike />}
            <span className="count-display">
              {dislikeCount > 0 && dislikeCount}
            </span>
          </button>
          <button
            className="text-button"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            回复
          </button>
        </div>
        {showReplyForm && (
          <form
            onSubmit={handleReplySubmit}
            className="comment-form reply-form"
          >
            <textarea
              ref={replyTextareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`回复 @${comment.userDto.userNickName?comment.userDto.userNickName:comment.userDto.userName}`}
              rows="1"
              disabled={!auth.userId || isSubmittingReply}
            />
            <button
              type="submit"
              disabled={!replyText.trim() || isSubmittingReply}
            >
              {isSubmittingReply ? "..." : "发布"}
            </button>
            {replyError && <p className="form-error">{replyError}</p>}
          </form>
        )}

        {comment.subCommentsDto && comment.subCommentsDto.length > 0 && (
          <ul className="comment-replies-list">
            {comment.subCommentsDto.map((reply) => {
              const normalizedReply = {
                commentId: reply.subCommentId,
                commentContent: reply.subCommentContent,
                commentTimestamp: reply.subCommentTimestamp,
                commentLikedCount: reply.subCommentLikedCount,
                commentDislikedCount: reply.subCommentDislikedCount,
                userDto: reply.userDto,
                replyToUserDto: reply.replyToUserDto,
                subCommentsDto: reply.subCommentsDto || [],
              };
              return (
                <CommentListItem
                  key={normalizedReply.commentId}
                  comment={normalizedReply}
                  onReplyAdded={onReplyAdded}
                  rootCommentId={rootCommentId || comment.commentId}
                />
              );
            })}
          </ul>
        )}
      </div>
    </li>
  );
};

export default CommentListItem;
