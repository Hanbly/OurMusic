// src/pages/CommentPanel.js
import React, { useState, useContext, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import axiosClient from "../../api-config";
import { AuthContext } from "../../context/auth-context";

import CommentItem from "./CommentItem";
import "./CommentPanel.css"; // 这个 CSS 文件现在只包含评论内容的样式

// CommentPanel 主组件
const CommentPanel = ({ musicId, comments, onClose, onCommentAdded }) => {
  const auth = useContext(AuthContext);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setError("评论内容不能为空哦");
      return;
    }
    if (!auth.userId) {
      auth.openLoginModal();
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const response = await axiosClient.post(
        `/api/comment`,
        {
          commentContent: commentText,
          musicDto: {
            musicId: musicId,
          },
          userDto: {
            userId: auth.userId,
          }
        }
      );
      if (response.data && response.data.code === 200) {
        setCommentText("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
        onCommentAdded(response.data.data);
      } else {
        throw new Error(response.data.message || "发布失败");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "发布评论时发生错误，请稍后再试。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaChange = (e) => {
    setCommentText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  return (
    <>
      <header className="panel-header">
        <h3>评论 ({comments.length})</h3>
        <button className="close-button" onClick={onClose}>
          <IoMdClose />
        </button>
      </header>

      <section className="comment-list-section">
        <ul>
          {comments.map((comment) => (
            <CommentItem key={comment.commentId} comment={comment} />
          ))}
          {comments.length === 0 && (
            <p className="no-comments">还没有评论，快来抢沙发吧！</p>
          )}
        </ul>
      </section>

      <footer className="panel-footer">
        <form onSubmit={handlePostComment} className="comment-form">
          <textarea
            ref={textareaRef}
            value={commentText}
            onChange={handleTextareaChange}
            placeholder={
              auth.userId ? "留下你的精彩评论..." : "请登录后发表评论"
            }
            rows="1"
            disabled={!auth.userId || isSubmitting}
          />
          <button type="submit" disabled={!commentText.trim() || isSubmitting}>
            {isSubmitting ? "发布中..." : "发布"}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </footer>
    </>
  );
};

export default CommentPanel;
