import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPlay, FaPause } from "react-icons/fa";

import axiosClient from '../../api-config';
import { useAudio } from '../../context/audio-context';
import { AuthContext } from '../../context/auth-context';

import MusicListItemPublic from '../../shared/components/UI/MusicListItemPublic';
import CommentListItem from '../../shared/components/UI/CommentListItem';
import Pagination from '../../shared/components/UI/Pagination';
import "./CollectionInfo.css";

const CollectionInfo = () => {
  const { collectionId } = useParams();
  const [collectionData, setCollectionData] = useState(null);
  const [musics, setMusics] = useState([]);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = useContext(AuthContext);
  const { 
    playTrack, 
    currentTrack, 
    isPlaying, 
    togglePlayPause,
    playlist
  } = useAudio();

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const textareaRef = useRef(null);

  const isCurrentCollectionPlaying = 
    playlist.length > 0 &&
    musics.length > 0 &&
    playlist[0].musicId === musics[0].musicId;

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(`/api/collection/${collectionId}`, {
          params: {
            page: currentPage - 1,
            size: 15 
          }
        });
        const result = response.data;
        if (result && result.code === 200) {
          setCollectionData(result.data);
          setMusics(result.data.musics || []);
          setTotalPages(result.data.totalPages || 1);
          if (currentPage === 1) {
            setComments(result.data.commentDto || []);
          }
        } else {
          throw new Error(result.message || '未能获取歌单详情');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [collectionId, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePlayAll = () => {
    if (musics.length > 0) {
      if (isCurrentCollectionPlaying) {
        togglePlayPause();
      } else {
        playTrack(musics[0], musics, auth.userId);
      }
    }
  };
  
  const handlePlaySingle = (music) => {
    playTrack(music, musics, auth.userId);
  }

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return setCommentError("评论内容不能为空");
    if (!auth.userId) return auth.openLoginModal();
    
    setIsSubmitting(true);
    setCommentError("");
    try {
      const response = await axiosClient.post(`/api/comment`, {
        commentContent: commentText,
        commentOwnerType: "COLLECTION",
        commentOwnerId: collectionId,
        userDto: { userId: auth.userId },
      });
      if (response.data && response.data.code === 200) {
        setCommentText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setComments(prev => [response.data.data, ...prev]);
        setCollectionData(prev => ({...prev, collectionCommentedCount: prev.collectionCommentedCount + 1}));
      } else {
        throw new Error(response.data.message || "发布失败");
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || "发布评论失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyAdded = (newReply, parentCommentId) => {
    const normalizedNewReply = {
      commentId: newReply.subCommentId,
      commentContent: newReply.subCommentContent,
      commentTimestamp: newReply.subCommentTimestamp,
      commentLikedCount: newReply.subCommentLikedCount,
      commentDislikedCount: newReply.subCommentDislikedCount,
      userDto: newReply.userDto,
      replyToUserDto: newReply.replyToUserDto,
      subCommentsDto: [],
      isLiked: false,
      isDisliked: false,
    };
    const simplifiedAddReply = (allComments) => {
      return allComments.map((topLevelComment) => {
        if (topLevelComment.commentId === parentCommentId) {
          const updatedSubComments = topLevelComment.subCommentsDto
            ? [...topLevelComment.subCommentsDto, normalizedNewReply]
            : [normalizedNewReply];
          return { ...topLevelComment, subCommentsDto: updatedSubComments };
        }
        return topLevelComment;
      });
    };
    setComments((prevComments) => simplifiedAddReply(prevComments));
  };
  
  if (isLoading && !collectionData) {
    return <div className="page-status">正在加载歌单...</div>;
  }

  if (error) {
    return <div className="page-status error">错误: {error}</div>;
  }

  if (!collectionData) {
    return <div className="page-status">未找到歌单数据。</div>;
  }

  return (
    <div className="collection-info-page">
      <header className="collection-info-header">
        <div className="header__image-container" onClick={handlePlayAll}>
          <img src={collectionData.collectionImageFileUrl} alt={collectionData.collectionName} />
          <div className="play-overlay">
            {isCurrentCollectionPlaying && isPlaying ? <FaPause /> : <FaPlay />}
          </div>
        </div>
        <div className="header__details">
          <span className="header__tag">歌单</span>
          <h1 className="header__title">{collectionData.collectionName}</h1>
          <p className="header__description">{collectionData.collectionDescription || '暂无描述'}</p>
          <div className="header__meta">
            <Link to={`/${collectionData.user.userId}/myMusics`} className="header__user">
              <img src={collectionData.user.userAvatarFileUrl} alt={collectionData.user.userNickName ? collectionData.user.userNickName : collectionData.user.userName} className="user__avatar" />
              <span>{collectionData.user.userNickName ? collectionData.user.userNickName : collectionData.user.userName}</span>
            </Link>
            <span className="meta__song-count">{collectionData.collectionMusicsNumber} 首音乐</span>
          </div>
          <div className="header__actions">
            <button className="action-button play-all" onClick={handlePlayAll}>
              {isCurrentCollectionPlaying && isPlaying ? <FaPause /> : <FaPlay />}
              {isCurrentCollectionPlaying && isPlaying ? '暂停播放' : '播放全部'}
            </button>
          </div>
        </div>
      </header>

      <div className="collection-content-body">
        <main className="music-list-container">
          {isLoading ? (
            <div className="page-status">正在加载音乐...</div>
          ) : (
            <>
              <ul>
                {musics.length > 0 ? (
                  musics.map((music, index) => (
                    <MusicListItemPublic 
                      key={music.musicId} 
                      music={music}
                      index={(currentPage - 1) * 15 + index + 1}
                      onPlay={() => handlePlaySingle(music)}
                      isPlaying={currentTrack?.musicId === music.musicId && isPlaying}
                      width="100%"
                    />
                  ))
                ) : (
                  <li className="no-music-message">这个歌单还没有收藏音乐。</li>
                )}
              </ul>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>

        <aside className="collection-comments-section">
          <h3 className="comments-section-title">评论 ({collectionData.collectionCommentedCount})</h3>
          <div className="comments-list-wrapper">
            {comments && comments.length > 0 ? (
              <ul className="comment-list-root">
                {comments.map((comment) => (
                  <CommentListItem
                    key={comment.commentId}
                    comment={comment}
                    onReplyAdded={handleReplyAdded}
                    rootCommentId={comment.commentId}
                  />
                ))}
              </ul>
            ) : (
              <p className="no-comments">还没有评论，快来抢沙发吧！</p>
            )}
          </div>
          <footer className="comment-form-footer">
            <form onSubmit={handlePostComment} className="comment-form">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={auth.userId ? "留下你的精彩评论..." : "请登录后发表评论"}
                rows="1"
                disabled={!auth.userId || isSubmitting}
              />
              <button type="submit" disabled={!commentText.trim() || isSubmitting}>
                {isSubmitting ? "..." : "发布"}
              </button>
            </form>
            {commentError && <p className="form-error">{commentError}</p>}
          </footer>
        </aside>
      </div>
    </div>
  );
};

export default CollectionInfo;