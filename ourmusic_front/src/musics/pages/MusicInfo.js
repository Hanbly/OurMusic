import React, { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
  FaRegStar,
  FaStar,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { RiReplay15Line } from "react-icons/ri";
import { IoPlayBackOutline, IoPlayForwardOutline } from "react-icons/io5";
import { BsRepeat1, BsRepeat, BsShuffle, BsThreeDots } from "react-icons/bs";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import { GrShareOption, GrInstallOption } from "react-icons/gr";

import axiosClient from "../../api-config";
import { useAudio } from "../../context/audio-context";
import { AuthContext } from "../../context/auth-context";
import { useNotification } from "../../context/notification-context";
import MusicOutputContainer from "../components/MusicOutputContainer";
import DropdownMenuContent from "../../shared/components/UI/DropdownMenuContent";
import CollectionModal from "../../shared/components/EditModal/CollectModal";
import CommentListItem from "../../shared/components/UI/CommentListItem";
import axiosDownload from "../../api-config-download";

import "./MusicInfo.css";

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return "00:00";
  const floorSeconds = Math.floor(seconds);
  const min = Math.floor(floorSeconds / 60);
  const sec = floorSeconds % 60;
  return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
};

const MusicInfo = ({ musicData, onClose, onCommentAdded }) => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playTrack,
    playNext,
    playPrevious,
    rewind15,
    currentTime,
    duration,
    progress,
    seek,
    volume,
    isMuted,
    changeVolume,
    toggleMute,
    PlayModes,
    playMode,
    togglePlayMode,
    addTrackToList,
  } = useAudio();
  const auth = useContext(AuthContext);
  const { addToast } = useNotification();

  // --- 关键修改 1: 引入内部状态作为唯一数据源 ---
  const [internalMusicData, setInternalMusicData] = useState(musicData);

  const [activeView, setActiveView] = useState("details");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const textareaRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [collectCount, setCollectCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);

  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const playRequestRef = useRef(null);

  // --- 关键修改 2: 添加 useEffect 以获取最新的、包含用户状态的数据 ---
  useEffect(() => {
    // 立即用传入的 props 更新，保证切换歌曲时 UI 响应迅速
    setInternalMusicData(musicData);

    if (!musicData || !musicData.musicId || auth.isAuthLoading) {
      return;
    }

    const fetchDetailedMusicData = async () => {
      try {
        const params = {};
        if (auth.userId) {
          params.operateUserId = auth.userId;
        }
        const response = await axiosClient.get(`/api/music/${musicData.musicId}`, { params });
        if (response.data.code === 200 && response.data.data) {
          // 使用从API获取的最新数据更新内部状态
          setInternalMusicData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch detailed music info:", error);
        // 如果获取失败，仍然使用 props 传入的数据
      }
    };

    fetchDetailedMusicData();
  }, [musicData, auth.userId, auth.isAuthLoading]);


  // 自动播放逻辑
  useEffect(() => {
    if (!internalMusicData || !internalMusicData.musicId) return;
    if (internalMusicData.musicId === currentTrack?.musicId) {
      playRequestRef.current = internalMusicData.musicId;
      return;
    }
    if (playRequestRef.current === internalMusicData.musicId) return;

    playRequestRef.current = internalMusicData.musicId;
    playTrack(internalMusicData, [internalMusicData], auth.userId);
  }, [internalMusicData.musicId, playTrack]);

  const isThisMusicPlaying = currentTrack?.musicId === internalMusicData.musicId && isPlaying;
  const isCurrentlySelectedTrack = currentTrack?.musicId === internalMusicData.musicId;
  const isOwner = auth.userId && internalMusicData.userDto?.userId === auth.userId;

  // --- 关键修改 3: 所有衍生状态都依赖于 internalMusicData ---
  useEffect(() => {
    if (internalMusicData) {
      setComments(internalMusicData.commentsDto || []);
      setIsLiked(internalMusicData.operateUserLikedOrNot || false);
      setIsDisliked(internalMusicData.operateUserDislikedOrNot || false);
      setIsCollected(internalMusicData.operateUserCollectedOrNot || false);
      setLikeCount(internalMusicData.musicLikedCount || 0);
      setDislikeCount(internalMusicData.musicDislikedCount || 0);
      setCollectCount(internalMusicData.musicCollectedCount || 0);
      setDownloadCount(internalMusicData.musicDownloadCount || 0);
    }
  }, [internalMusicData]);

  // --- 以下所有函数中的 musicData 都替换为 internalMusicData ---
  const handleLikeClick = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    axiosClient
      .post(`/api/data-stats/like/MUSIC/${internalMusicData.musicId}/user/${auth.userId}`)
      .then((response) => {
        if (response.data.message === "点赞成功") {
          setIsLiked(true);
          setLikeCount((prev) => prev + 1);
          if (isDisliked) {
            axiosClient.post(`/api/data-stats/dislike/MUSIC/${internalMusicData.musicId}/user/${auth.userId}`)
            .then(() => {
                setIsDisliked(false);
                setDislikeCount(prev => prev - 1);
            });
          }
        } else if (response.data.message === "取消点赞成功") {
          setIsLiked(false);
          setLikeCount((prev) => (prev > 0 ? prev - 1 : 0));
        }
      })
      .catch((error) => console.error("点赞/取消点赞失败:", error))
      .finally(() => setIsInteracting(false));
  };

  const handleDislikeClick = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    axiosClient
      .post(`/api/data-stats/dislike/MUSIC/${internalMusicData.musicId}/user/${auth.userId}`)
      .then((response) => {
        if (response.data.message === "点踩成功") {
          setIsDisliked(true);
          setDislikeCount((prev) => prev + 1);
          if (isLiked) {
             axiosClient.post(`/api/data-stats/like/MUSIC/${internalMusicData.musicId}/user/${auth.userId}`)
            .then(() => {
                setIsLiked(false);
                setLikeCount(prev => prev - 1);
            });
          }
        } else if (response.data.message === "取消点踩成功") {
          setIsDisliked(false);
          setDislikeCount((prev) => (prev > 0 ? prev - 1 : 0));
        }
      })
      .catch((error) => console.error("点踩/取消点踩失败:", error))
      .finally(() => setIsInteracting(false));
  };

  const handleFavoriteClick = () => {
    axiosClient
      .put(`/api/data-stats/collect/MUSIC/${internalMusicData.musicId}/user/${auth.userId}/default`)
      .then((response) => {
        if (response.data.message === "音乐加入默认歌单成功") {
          setIsCollected(true);
          setCollectCount((prev) => prev + 1);
        } else if (response.data.message === "音乐取消加入默认歌单成功") {
          setIsCollected(false);
          setCollectCount((prev) => (prev > 0 ? prev - 1 : 0));
        }
      })
      .catch((error) => console.error("收藏/取消收藏失败:", error));
  };

  const handleDownloadClick = () => {
    axiosDownload
      .get(`${internalMusicData.musicFileUrl}?musicId=${internalMusicData.musicId}&userId=${auth.userId}`, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${internalMusicData.musicName}${getFileExtensionWithRegex(internalMusicData.musicFileUrl)}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadCount((prev) => prev + 1);
      });
  };

  const handlePlayMusic = () => {
    if (isThisMusicPlaying) {
      togglePlayPause();
    } else {
      playTrack(internalMusicData, [internalMusicData], auth.userId);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setCommentError("评论内容不能为空哦");
      return;
    }
    if (!auth.userId) {
      auth.openLoginModal();
      return;
    }
    setIsSubmitting(true);
    setCommentError("");
    try {
      const response = await axiosClient.post(`/api/comment`, {
        commentContent: commentText,
        commentOwnerType: "MUSIC",
        commentOwnerId: internalMusicData.musicId,
        userDto: { userId: auth.userId },
      });
      if (response.data && response.data.code === 200) {
        setCommentText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        const newComment = response.data.data;
        setComments((prevComments) => [newComment, ...prevComments]);
        onCommentAdded(newComment);
      } else {
        throw new Error(response.data.message || "发布失败");
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || "发布评论时发生错误，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... 其他没有引用 musicData 的函数保持不变 ...
  const handleProgressDrag = (e) => {
    const progressBar = progressBarRef.current;
    if (!progressBar || !duration) return;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, offsetX / rect.width));
    seek(newProgress * duration);
    const handleMouseMove = (moveEvent) => {
      const moveOffsetX = moveEvent.clientX - rect.left;
      const newMoveProgress = Math.max(0, Math.min(1, moveOffsetX / rect.width));
      seek(newMoveProgress * duration);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleVolumeDrag = (e) => {
    const volumeBar = volumeBarRef.current;
    if (!volumeBar) return;
    const rect = volumeBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, offsetX / rect.width));
    changeVolume(newVolume);
    const handleMouseMove = (moveEvent) => {
      const moveOffsetX = moveEvent.clientX - rect.left;
      const newMoveVolume = Math.max(0, Math.min(1, moveOffsetX / rect.width));
      changeVolume(newMoveVolume);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleAddToPlaylist = (track) => {
    addTrackToList(track);
    addToast(`已将《${track.musicName}》添加到播放列表。`, 'success');
  };

  const handleCollect = () => {
    if (!auth.userId) {
      auth.openLoginModal();
      return;
    }
    setShowCollectionModal(true);
    setIsMenuOpen(false);
  };

  const handleShare = () => {
    addToast("分享功能待实现", 'info');
  };

  const handleDownload = (track) => {
    axiosDownload.get(`${track.musicFileUrl}`, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${track.musicName}${getFileExtensionWithRegex(track.musicFileUrl)}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  function getFileExtensionWithRegex(filename) {
    if (typeof filename !== "string") return "";
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0] : "";
  }

  const handleCollectSuccess = () => {
    addToast(`歌曲《${currentTrack.musicName}》收藏成功！`, 'success');
  };

  const handleReplyAdded = (newReply, parentCommentId) => {
    const addReplyToTree = (nodes) => {
      return nodes.map((node) => {
        if (node.commentId === parentCommentId) {
          const updatedSubComments = node.subCommentsDto ? [...node.subCommentsDto, newReply] : [newReply];
          return { ...node, subCommentsDto: updatedSubComments };
        }
        if (node.subCommentsDto && node.subCommentsDto.length > 0) {
          return { ...node, subCommentsDto: addReplyToTree(node.subCommentsDto) };
        }
        return node;
      });
    };
    setComments((prevComments) => addReplyToTree(prevComments));
  };

  const handleTextareaChange = (e) => {
    setCommentText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <FaVolumeMute />;
    if (volume < 0.5) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  const PlayModeIcon = () => {
    switch (playMode) {
      case PlayModes.SINGLE_REPEAT: return <BsRepeat1 />;
      case PlayModes.SHUFFLE: return <BsShuffle />;
      case PlayModes.LIST_LOOP: default: return <BsRepeat />;
    }
  };

  const getPlayModeTitle = () => {
    switch (playMode) {
      case PlayModes.SINGLE_REPEAT: return "单曲循环";
      case PlayModes.SHUFFLE: return "随机播放";
      case PlayModes.LIST_LOOP: default: return "列表循环";
    }
  };
  
  // 如果数据还没加载完成，可以显示一个加载状态或什么都不显示
  if (!internalMusicData) {
    return null; // 或者一个加载指示器
  }

  const { userDto } = internalMusicData;
  const releaseYear = internalMusicData.musicYear ? new Date(internalMusicData.musicYear).getFullYear() : "未知";
  const triggerRect = triggerRef.current?.getBoundingClientRect();

  return (
    <>
      {currentTrack && (
        <CollectionModal
          show={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          music={currentTrack}
          userId={auth.userId}
          onSuccess={handleCollectSuccess}
        />
      )}

      <div className="music-info-panel">
        <div
          className="music-info-panel__background"
          style={{ backgroundImage: `url(${internalMusicData.musicImageFileUrl})` }}
        />

        <div className="music-info__left">
          <div className="art-container" onClick={handlePlayMusic}>
            <img
              src={internalMusicData.musicImageFileUrl}
              alt={internalMusicData.musicName}
              className="art-cover"
            />
            <div className="vinyl-record" />
            <div className="play-overlay">
              {isThisMusicPlaying ? <FaPause size={50} /> : <FaPlay size={50} />}
            </div>
          </div>
          <h1 className="music-info__title">{internalMusicData.musicName}</h1>
          <p className="music-info__artist">{internalMusicData.musicArtist}</p>
          <div className="music-info__actions">
            <button
              className="icon-button"
              disabled={isInteracting}
              onClick={() => {
                if (!auth.userId) return auth.openLoginModal();
                if (isOwner) return addToast("不能点赞自己分享的歌曲哦！", 'info');
                handleLikeClick();
              }}
            >
              {isLiked ? <BiSolidLike /> : <BiLike />}
              <span className="count-display">{likeCount}</span>
            </button>
            <button
              className="icon-button"
              disabled={isInteracting}
              onClick={() => {
                if (!auth.userId) return auth.openLoginModal();
                if (isOwner) return addToast("不能点踩自己分享的歌曲哦！", 'info');
                handleDislikeClick();
              }}
            >
              {isDisliked ? <BiSolidDislike /> : <BiDislike />}
              <span className="count-display">{dislikeCount}</span>
            </button>
            <button
              className="icon-button"
              onClick={auth.userId ? handleFavoriteClick : auth.openLoginModal}
            >
              {isCollected ? <FaStar /> : <FaRegStar />}
              <span className="count-display">{collectCount}</span>
            </button>
            <button className="icon-button" onClick={handleDownloadClick}>
              <GrInstallOption />
              <span className="count-display">{downloadCount}</span>
            </button>
          </div>

          {isCurrentlySelectedTrack && (
            <div className="music-info-player">
              <div className="music-info-player__progress-section">
                <span className="time-display">{formatTime(currentTime)}</span>
                <div
                  className="progress-bar-container"
                  ref={progressBarRef}
                  onMouseDown={handleProgressDrag}
                >
                  <div className="progress-bar-bg"></div>
                  <div
                    className="progress-bar-fg"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="time-display">{formatTime(duration)}</span>
                <div className="volume-controls">
                  <button title="静音" className="player-button" onClick={toggleMute}>
                    <VolumeIcon />
                  </button>
                  <div
                    className="volume-slider-container"
                    ref={volumeBarRef}
                    onMouseDown={handleVolumeDrag}
                  >
                    <div className="volume-slider-bg"></div>
                    <div
                      className="volume-slider-fg"
                      style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="music-info-player__controls">
                <button title="快退15秒" className="player-button secondary" onClick={rewind15}>
                  <RiReplay15Line />
                </button>
                <button title="上一首" className="player-button" onClick={playPrevious}>
                  <IoPlayBackOutline />
                </button>
                <button
                  title={isPlaying ? "暂停" : "播放"}
                  className="player-button play-pause-button"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button title="下一首" className="player-button" onClick={playNext}>
                  <IoPlayForwardOutline />
                </button>
                <button title={getPlayModeTitle()} className="player-button secondary" onClick={togglePlayMode}>
                  <PlayModeIcon />
                </button>
                {/* <div className="player-menu-container">
                  <button
                    ref={triggerRef}
                    title="更多操作"
                    className="player-button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                  >
                    <BsThreeDots />
                  </button>
                </div> */}
              </div>
            </div>
          )}
        </div>

        <div className="music-info__right">
          <button className="panel-close-button" onClick={onClose}>
            <IoMdClose size={24} />
          </button>

          <header className="view-switcher">
            <button
              className={`switcher-tab ${activeView === "details" ? "active" : ""}`}
              onClick={() => setActiveView("details")}
            >
              歌曲信息
            </button>
            <button
              className={`switcher-tab ${activeView === "comments" ? "active" : ""}`}
              onClick={() => setActiveView("comments")}
            >
              评论 ({internalMusicData.musicCommentedCount})
            </button>
          </header>

          <main className="view-content">
            {activeView === "details" && userDto && (
              <div className="details-view">
                <dl className="details-list">
                  <dt>艺术家</dt>
                  <dd>{internalMusicData.musicArtist}</dd>
                  <dt>专辑</dt>
                  <dd>{internalMusicData.musicAlbum}</dd>
                  <dt>年份</dt>
                  <dd>{releaseYear}</dd>
                </dl>
                <div className="details__user">
                  <div className="user-contribution-section">
                    <div className="user-contribution-title">
                      由{" "}
                      <Link className="user-link" to={`/${userDto.userId}/myMusics`}>
                        <img
                          src={userDto.userAvatarFileUrl}
                          alt={userDto.userNickName || userDto.userName}
                          className="user__avatar"
                        />
                      </Link>{" "}
                      分享的其它歌曲
                    </div>
                    <div>
                      <MusicOutputContainer
                        musicKey="Shared"
                        keyValue={userDto.userId}
                        width="830px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === "comments" && (
              <div className="comments-view">
                <section className="comment-list-section">
                  {comments && comments.length > 0 ? (
                    <ul className="comment-list-root">
                      {comments.map((comment) => (
                        <CommentListItem
                          key={comment.commentId}
                          comment={comment}
                          rootCommentId={comment.commentId}
                          onReplyAdded={handleReplyAdded}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="no-comments">还没有评论，快来抢沙发吧！</p>
                  )}
                </section>
                <footer className="comment-form-footer">
                  <form onSubmit={handlePostComment} className="comment-form">
                    <textarea
                      ref={textareaRef}
                      value={commentText}
                      onChange={handleTextareaChange}
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
              </div>
            )}
          </main>
        </div>

        {isMenuOpen &&
          triggerRect &&
          createPortal(
            <div
              style={{
                position: "absolute",
                top: `${triggerRect.bottom + window.scrollY + 5}px`,
                left: `${triggerRect.left + window.scrollX}px`,
                zIndex: 1100,
              }}
            >
              <DropdownMenuContent
                ref={menuRef}
                music={currentTrack}
                isOwner={isOwner}
                onClose={() => setIsMenuOpen(false)}
                onAddToPlaylist={handleAddToPlaylist}
                onCollect={handleCollect}
                onShare={handleShare}
                onDownload={handleDownload}
              />
            </div>,
            document.getElementById("portal-root")
          )}
      </div>
    </>
  );
};

export default MusicInfo;