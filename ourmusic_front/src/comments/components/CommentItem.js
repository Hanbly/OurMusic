import React, { useState } from "react";
import { Link } from "react-router-dom";

import { BiSolidLike, BiLike } from "react-icons/bi";
import axiosClient from "../../api-config";
import "./CommentPanel.css";

const CommentItem = ({ comment }) => {
  const {
    commentId,
    userDto,
    commentContent,
    commentTimestamp,
    commentLikedCount,
  } = comment;
  const [isLiked, setIsLiked] = useState(false);
  const [commentLikeCountNow, setCommentLikeCountNow] =
    useState(commentLikedCount);

  const formatTime = (time) => {
    return new Date(time).toLocaleString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLikeComment = () => {
    if (isLiked) {
      axiosClient
        .put(`/api/comment/${commentId}/cancelLike`)
        .then((response) => {
          if (response.data && response.data.code === 200) {
            setCommentLikeCountNow(commentLikeCountNow - 1);
            setIsLiked(false);
            return;
          }
        });
      return;
    }
    axiosClient.put(`/api/comment/${commentId}/like`).then((response) => {
      if (response.data && response.data.code === 200) {
        setCommentLikeCountNow(commentLikeCountNow + 1);
        setIsLiked(true);
        return;
      }
    });
  };

  return (
    <li className="comment-item">
      {/* 1. 头像链接 */}
      <Link to={`/${userDto.userId}/myMusics`} className="comment-avatar-link">
        <img
          src={userDto.userAvatarFileUrl}
          alt={userDto.userNickName?userDto.userNickName:userDto.userName}
          className="comment-user-avatar"
        />
      </Link>

      {/* 2. 评论主体容器，包含了所有文本内容 */}
      <div className="comment-main">
        <div className="comment-header">
          <Link to={`/${userDto.userId}/myMusics`} className="comment-user-name-link">
            <span className="comment-user-name">{userDto.userNickName?userDto.userNickName:userDto.userName}</span>
          </Link>
          <span className="comment-time">{formatTime(commentTimestamp)}</span>
        </div>
        
        <p className="comment-content">{commentContent}</p>
        
        <div className="comment-footer">
          <button className="comment-like-button" onClick={handleLikeComment}>
            {isLiked ? <BiSolidLike color="#8a2be2" /> : <BiLike />}
            <span>{commentLikeCountNow > 0 ? commentLikeCountNow : "赞"}</span>
          </button>
        </div>
      </div>
    </li>
  );
};

export default CommentItem;
