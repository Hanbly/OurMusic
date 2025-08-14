import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPlay, FaPause, FaPlus } from "react-icons/fa";
import EditModal from "../../shared/components/EditModal/EditModal";
import axiosClient from "../../api-config";
import { useAudio } from "../../context/audio-context";
import { AuthContext } from "../../context/auth-context";
import { useNotification } from "../../context/notification-context";
import MusicListItemPublic from "../../shared/components/UI/MusicListItemPublic";
import CommentListItem from "../../shared/components/UI/CommentListItem";
import Pagination from "../../shared/components/UI/Pagination";
import "./CollectionInfo.css";

// --- 分页逻辑辅助函数 (用于Modal, 无需修改) ---
const DOTS = "...";
const getPaginationItems = (currentPage, totalPageCount, siblingCount = 1) => {
  const totalPageNumbers = siblingCount * 2 + 5;
  if (totalPageCount <= totalPageNumbers) {
    return Array.from({ length: totalPageCount }, (_, i) => i + 1);
  }
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPageCount
  );
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1;
  const firstPageIndex = 1;
  const lastPageIndex = totalPageCount;
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, totalPageCount];
  }
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPageCount - rightItemCount + 1 + i
    );
    return [firstPageIndex, DOTS, ...rightRange];
  }
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = [];
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      middleRange.push(i);
    }
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }
};

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
  const { playTrack, currentTrack, isPlaying, togglePlayPause, playlist } =
    useAudio();
  const { addToast } = useNotification();

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const textareaRef = useRef(null);

  const [isManaging, setIsManaging] = useState(false);
  const [selectedMusicIds, setSelectedMusicIds] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);

  // --- "添加音乐" 模态框的状态 ---
  const [isSharingMusic, setIsSharingMusic] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newMusics, setNewMusics] = useState([]);
  const [shareError, setShareError] = useState("");
  const musicFileInputRef = useRef(null);
  const musicImageInputRefs = useRef([]);
  const [unifiedImageFile, setUnifiedImageFile] = useState(null);
  const [unifiedImagePreview, setUnifiedImagePreview] = useState(null);
  const unifiedImageInputRef = useRef(null);
  const [lastImageDetails, setLastImageDetails] = useState(null);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 1;

  const isCurrentCollectionPlaying =
    playlist.length === musics.length &&
    playlist.length > 0 &&
    playlist.every((track, index) => track.musicId === musics[index].musicId);

  useEffect(() => {
    if (auth.isAuthLoading) {
      return;
    }

    const fetchCollectionDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(
          `/api/collection/${collectionId}`,
          {
            params: {
              page: currentPage - 1,
              size: 15,
              operateUserId: auth.userId || -1,
            },
          }
        );
        const result = response.data;
        if (result && result.code === 200 && result.data) {
          const data = result.data;
          setCollectionData(data);
          setMusics(data.musics || []);
          setTotalPages(data.totalPages || 1);
          if (currentPage === 1) {
            setComments(data.commentDto || []);
          }
        } else {
          throw new Error(result.message || "未能获取歌单详情");
        }
      } catch (err) {
        setError(err.message || "加载歌单失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [collectionId, currentPage, auth.userId, auth.isAuthLoading]);

  useEffect(() => {
    if (!isManaging) {
      setSelectedMusicIds([]);
    }
  }, [isManaging]);

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
  };

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
        setComments((prev) => [response.data.data, ...prev]);
        setCollectionData((prev) => ({
          ...prev,
          collectionCommentedCount: prev.collectionCommentedCount + 1,
        }));
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
    // 这是一个递归函数，它会创建状态树的全新副本
    const addReplyToTree = (commentsNode) => {
      // 使用 map 会返回一个新数组，保证了不可变性
      return commentsNode.map((comment) => {
        // 1. 如果找到了直接的父评论
        if (comment.commentId === parentCommentId) {
          // 创建新的子评论数组
          const updatedSubComments = comment.subCommentsDto
            ? [...comment.subCommentsDto, newReply]
            : [newReply];

          // 返回一个包含新子评论数组的、全新的父评论对象
          return { ...comment, subCommentsDto: updatedSubComments };
        }

        // 2. 如果当前评论不是父评论，但它可能有子评论，则递归处理它的子评论
        if (comment.subCommentsDto && comment.subCommentsDto.length > 0) {
          return {
            ...comment,
            subCommentsDto: addReplyToTree(comment.subCommentsDto), // 递归调用，返回新的子评论数组
          };
        }

        // 3. 如果没有匹配，且没有子评论，直接返回原始评论
        return comment;
      });
    };

    console.log("--- handleReplyAdded triggered ---");
    console.log("New reply received:", newReply);
    console.log("Parent comment ID:", parentCommentId);

    setComments((prevComments) => {
      console.log(
        "State BEFORE update:",
        JSON.parse(JSON.stringify(prevComments))
      ); // 深拷贝打印，防止看到后续修改
      const newCommentsState = addReplyToTree(prevComments);
      console.log(
        "State AFTER update:",
        JSON.parse(JSON.stringify(newCommentsState))
      );
      return newCommentsState;
    });
    // // 使用函数式更新，确保基于最新的状态进行修改
    // setComments(prevComments => addReplyToTree(prevComments));
  };

  const handleToggleManageMode = () => {
    setIsManaging((prev) => !prev);
  };

  const handleSelectMusic = (musicId) => {
    setSelectedMusicIds((prevSelected) =>
      prevSelected.includes(musicId)
        ? prevSelected.filter((id) => id !== musicId)
        : [...prevSelected, musicId]
    );
  };

  const handleRemoveSelected = async () => {
    if (selectedMusicIds.length === 0 || !auth.userId || isRemoving) return;

    setIsRemoving(true);
    setError(null);
    try {
      await axiosClient.put(
        `/api/data-stats/batch-d-collect/user/${auth.userId}/out-collection/${collectionId}`,
        selectedMusicIds.map((id) => ({
          collectStatsOwnerType: "MUSIC",
          collectStatsOwnerId: id,
        }))
      );
      setMusics((prevMusics) =>
        prevMusics.filter((music) => !selectedMusicIds.includes(music.musicId))
      );
      setCollectionData((prevData) => ({
        ...prevData,
        collectionMusicsNumber:
          prevData.collectionMusicsNumber - selectedMusicIds.length,
      }));
      setIsManaging(false);
      setSelectedMusicIds([]);
    } catch (err) {
      setError(
        err.response?.data?.message || "移出歌曲时发生未知错误，请稍后重试。"
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const resetMusicForm = () => {
    setNewMusics([]);
    setShareError("");
    setModalCurrentPage(1);
    setUnifiedImageFile(null);
    setUnifiedImagePreview(null);
    setLastImageDetails(null);
    if (musicFileInputRef.current) {
      musicFileInputRef.current.value = "";
    }
  };

  const openShareModal = () => {
    resetMusicForm();
    setShowShareModal(true);
  };

  const handleMusicImageChange = (event, index) => {
    const file = event.target.files[0];
    if (!file) {
      event.target.value = null;
      return;
    }
    if (
      lastImageDetails &&
      lastImageDetails.name === file.name &&
      lastImageDetails.size === file.size
    ) {
      const proceed = window.confirm(
        "您正尝试上传同一张图片。\n\n建议使用'统一封面'功能一次性应用到所有歌曲。\n\n要继续为当前歌曲单独设置吗？"
      );
      if (!proceed) {
        event.target.value = null;
        return;
      }
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMusics((prev) => {
        const updatedMusics = [...prev];
        if (updatedMusics[index]) {
          updatedMusics[index].imageFile = file;
          updatedMusics[index].imagePreview = reader.result;
        }
        return updatedMusics;
      });
      setLastImageDetails({ name: file.name, size: file.size });
      event.target.value = null;
    };
    reader.readAsDataURL(file);
  };

  const handleUnifiedImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUnifiedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUnifiedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = null;
  };

  const applyUnifiedImageToAll = () => {
    if (!unifiedImageFile || !unifiedImagePreview) {
      addToast("请先选择一个统一封面。", "info");
      return;
    }
    setNewMusics((prev) =>
      prev.map((music) => ({
        ...music,
        imageFile: unifiedImageFile,
        imagePreview: unifiedImagePreview,
      }))
    );
    addToast("统一封面已应用到所有歌曲。", "success");
  };

  const applyUnifiedImageToThis = () => {
    if (!unifiedImageFile || !unifiedImagePreview) {
      addToast("请先选择一个统一封面。", "info");
      return;
    }
    const currentIndex = modalCurrentPage - 1;
    setNewMusics((prev) => {
      const updatedMusics = [...prev];
      if (updatedMusics[currentIndex]) {
        updatedMusics[currentIndex].imageFile = unifiedImageFile;
        updatedMusics[currentIndex].imagePreview = unifiedImagePreview;
      }
      return updatedMusics;
    });
    addToast(`封面已应用到当前第 ${modalCurrentPage} 首歌曲。`, "success");
  };

  const handleMusicFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    const initialLength = newMusics.length;
    setShareError("");
    const tempMusics = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      musicFile: file,
      imageFile: null,
      imagePreview: null,
      musicName: "正在解析...",
      musicArtist: "",
      musicAlbum: "",
      musicGenre: "",
      musicYear: "",
      isLoading: true,
      error: null,
    }));
    setNewMusics((prev) => [...prev, ...tempMusics]);
    setModalCurrentPage(initialLength + 1);
    const musicDataPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axiosClient.post(
          "/api/files/preview",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return {
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          ...response.data.data,
          musicFile: file,
          isLoading: false,
        };
      } catch (error) {
        return {
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          musicFile: file,
          musicName: file.name,
          musicArtist: "",
          musicAlbum: "",
          musicGenre: "",
          musicYear: "",
          isLoading: false,
          error: "无法解析元数据，请手动填写",
        };
      }
    });
    const resolvedMusics = await Promise.all(musicDataPromises);
    setNewMusics((prev) => {
      const updatedList = [...prev];
      resolvedMusics.forEach((resolvedMusic, index) => {
        const updateIndex = initialLength + index;
        if (updatedList[updateIndex]) {
          updatedList[updateIndex] = {
            ...updatedList[updateIndex],
            ...resolvedMusic,
          };
        }
      });
      return updatedList;
    });
  };

  const handleMusicDataChange = (index, field, value) => {
    setNewMusics((prev) => {
      const updatedMusics = [...prev];
      if (updatedMusics[index]) {
        updatedMusics[index][field] = value;
      }
      return updatedMusics;
    });
  };

  const removeMusicItem = (indexToRemove) => {
    setNewMusics((prev) => prev.filter((_, index) => index !== indexToRemove));
    setModalCurrentPage((prev) =>
      Math.max(1, Math.min(prev, newMusics.length - 1))
    );
  };

  const handleShareMusic = async (event) => {
    event.preventDefault();
    if (newMusics.length === 0) {
      setShareError("请至少选择一个音乐文件。");
      return;
    }
    for (const [index, music] of newMusics.entries()) {
      if (
        !music.musicName ||
        !music.musicArtist ||
        !music.musicGenre ||
        !music.musicYear
      ) {
        setShareError(
          `请为第 ${index + 1} 首音乐 ("${
            music.musicName || music.musicFile.name
          }") 填写所有必填项。`
        );
        setModalCurrentPage(index + 1);
        return;
      }
    }

    setIsSharingMusic(true);
    setShareError("");

    try {
      const uploadPromises = newMusics.map(async (music) => {
        let musicImageFileId = null;
        if (music.imageFile) {
          const imageFormData = new FormData();
          imageFormData.append("file", music.imageFile);
          const imageUploadRes = await axiosClient.post(
            "/api/files/upload",
            imageFormData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          if (imageUploadRes.data.code === 200) {
            musicImageFileId = imageUploadRes.data.data.customFileId;
          } else {
            throw new Error(`歌曲 "${music.musicName}" 的封面上传失败`);
          }
        }
        const musicFormData = new FormData();
        musicFormData.append("file", music.musicFile);
        const musicUploadRes = await axiosClient.post(
          "/api/files/upload",
          musicFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (musicUploadRes.data.code !== 200) {
          throw new Error(`歌曲 "${music.musicName}" 的音乐文件上传失败`);
        }
        const {
          customFileId: musicFileId,
          fileUrl: musicFileUrl,
          musicDuring,
        } = musicUploadRes.data.data;
        return {
          musicName: music.musicName,
          musicArtist: music.musicArtist,
          musicAlbum: music.musicAlbum,
          musicGenre: music.musicGenre,
          musicYear: music.musicYear,
          musicFileId: musicFileId,
          musicFileUrl: musicFileUrl,
          musicDuring: musicDuring,
          musicImageFileId: musicImageFileId,
          userId: auth.userId,
        };
      });
      const batchData = await Promise.all(uploadPromises);
      const creationResponse = await axiosClient.post(
        "/api/music/batch",
        batchData
      );

      if (creationResponse.data.code !== 200) {
        throw new Error(creationResponse.data.message || "创建音乐失败");
      }

      const createdMusics = creationResponse.data.data;

      const collectPayload = createdMusics.map((music) => ({
        collectStatsOwnerType: "MUSIC",
        collectStatsOwnerId: music.musicId,
      }));

      await axiosClient.put(
        `/api/data-stats/batch-a-collect/user/${auth.userId}/to-collection/${collectionId}`,
        collectPayload
      );

      setShowShareModal(false);
      addToast(
        `成功添加 ${createdMusics.length} 首音乐到当前歌单！`,
        "success"
      );

      setMusics((prev) => [...createdMusics, ...prev]);
      setCollectionData((prev) => ({
        ...prev,
        collectionMusicsNumber:
          prev.collectionMusicsNumber + createdMusics.length,
      }));
    } catch (err) {
      setShareError(
        err.response?.data?.message || err.message || "添加音乐失败"
      );
    } finally {
      setIsSharingMusic(false);
    }
  };

  const indexOfLastItem = modalCurrentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentMusicItem = newMusics[indexOfFirstItem];
  const pageCount = Math.ceil(newMusics.length / ITEMS_PER_PAGE);
  const paginationItems = getPaginationItems(modalCurrentPage, pageCount);

  if (isLoading && !collectionData) {
    return <div className="page-status">正在加载歌单...</div>;
  }

  if (error && !collectionData) {
    return <div className="page-status error">错误: {error}</div>;
  }

  if (!collectionData) {
    return <div className="page-status">未找到歌单数据。</div>;
  }

  return (
    <>
      <div className="collection-info-page collection-detail-view">
        <div className="collection-main-content">
          <header className="collection-info-header">
            <div className="header__image-container" onClick={handlePlayAll}>
              <img
                src={collectionData.collectionImageFileUrl}
                alt={collectionData.collectionName}
              />
              <div className="play-overlay">
                {isCurrentCollectionPlaying && isPlaying ? (
                  <FaPause />
                ) : (
                  <FaPlay />
                )}
              </div>
            </div>
            <div className="header__details">
              <span className="header__tag">歌单</span>
              <h1 className="header__title">{collectionData.collectionName}</h1>
              <p className="header__description">
                {collectionData.collectionDescription || "暂无描述"}
              </p>
              <div className="header__meta">
                <Link
                  to={`/${collectionData.user.userId}/myMusics`}
                  className="header__user"
                >
                  <img
                    src={collectionData.user.userAvatarFileUrl}
                    alt={
                      collectionData.user.userNickName ||
                      collectionData.user.userName
                    }
                    className="user__avatar"
                  />
                  <span>
                    {collectionData.user.userNickName ||
                      collectionData.user.userName}
                  </span>
                </Link>
                <span className="meta__song-count">
                  {collectionData.collectionMusicsNumber} 首音乐
                </span>
              </div>
              <div className="header__actions">
                <button
                  className="action-button play-all"
                  onClick={handlePlayAll}
                >
                  {isCurrentCollectionPlaying && isPlaying ? (
                    <FaPause />
                  ) : (
                    <FaPlay />
                  )}
                  {isCurrentCollectionPlaying && isPlaying
                    ? "暂停播放"
                    : "播放全部"}
                </button>
                {auth.userId === collectionData.user.userId && (
                  <>
                    <button
                      className="action-button manage"
                      onClick={handleToggleManageMode}
                    >
                      {isManaging ? "完成" : "管理音乐"}
                    </button>
                    <button
                      className="action-button add-music"
                      onClick={openShareModal}
                    >
                      <FaPlus />
                      <span>添加音乐</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="music-list-container">
            {isManaging && (
              <div className="manage-actions-bar">
                <button
                  className="action-button remove-selected"
                  onClick={handleRemoveSelected}
                  disabled={selectedMusicIds.length === 0 || isRemoving}
                >
                  {isRemoving
                    ? "正在移出..."
                    : `移出所选 (${selectedMusicIds.length})`}
                </button>
              </div>
            )}
            {error && (
              <p className="page-status error" style={{ padding: "10px 0" }}>
                {error}
              </p>
            )}
            {isLoading && currentPage > 1 ? (
              <div className="page-status">正在加载音乐...</div>
            ) : (
              <>
                <ul>
                  {musics.length > 0 ? (
                    musics.map((music, index) => (
                      <div
                        className={`music-list-item-wrapper ${
                          isManaging ? "managing" : ""
                        }`}
                      >
                        {isManaging && (
                          <input
                            type="checkbox"
                            className="music-select-checkbox"
                            checked={selectedMusicIds.includes(music.musicId)}
                            onChange={() => handleSelectMusic(music.musicId)}
                            aria-label={`选择 ${music.musicName}`}
                          />
                        )}
                        <MusicListItemPublic
                          key={music.musicId}
                          music={music}
                          musicList={musics}
                          width="100%"
                        />
                      </div>
                    ))
                  ) : (
                    <li className="no-music-message">
                      这个歌单还没有收藏音乐。
                    </li>
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
        </div>

        <aside className="collection-comments-section">
          <h3 className="comments-section-title">
            评论 ({collectionData.collectionCommentedCount})
          </h3>
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
                placeholder={
                  auth.userId ? "留下你的精彩评论..." : "请登录后发表评论"
                }
                rows="1"
                disabled={!auth.userId || isSubmitting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
              >
                {isSubmitting ? "..." : "发布"}
              </button>
            </form>
            {commentError && <p className="form-error">{commentError}</p>}
          </footer>
        </aside>
      </div>

      {/* --- “添加音乐”模态框 JSX --- */}
      <EditModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="添加新音乐到歌单"
      >
        <form
          onSubmit={handleShareMusic}
          className="share-music-form-paginated"
        >
          {newMusics.length > 0 && (
            <div className="unified-upload-section">
              <div className="unified-upload-controls">
                <input
                  type="file"
                  accept="image/*"
                  ref={unifiedImageInputRef}
                  onChange={handleUnifiedImageChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="form-button-secondary"
                  onClick={() => unifiedImageInputRef.current.click()}
                >
                  选择统一封面
                </button>
                {unifiedImagePreview && (
                  <>
                    <button
                      type="button"
                      className="form-button-secondary"
                      onClick={applyUnifiedImageToThis}
                    >
                      应用到当前
                    </button>
                    <button
                      type="button"
                      className="form-button-secondary"
                      onClick={applyUnifiedImageToAll}
                    >
                      应用到全部
                    </button>
                  </>
                )}
              </div>
              {unifiedImagePreview && (
                <div className="image-upload-preview unified-preview">
                  <img src={unifiedImagePreview} alt="统一封面预览" />
                </div>
              )}
            </div>
          )}

          <div className="add-files-section">
            <input
              type="file"
              accept="audio/*"
              ref={musicFileInputRef}
              onChange={handleMusicFileChange}
              style={{ display: "none" }}
              multiple
            />
            <button
              type="button"
              className="file-upload-button large-button"
              onClick={() => musicFileInputRef.current.click()}
            >
              <FaPlus /> 选择或添加音乐文件
            </button>
            {newMusics.length > 0 && (
              <span className="file-count-indicator">
                已选择 {newMusics.length} 个文件
              </span>
            )}
          </div>

          {currentMusicItem ? (
            <div className="paginated-form-content">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={(el) =>
                  (musicImageInputRefs.current[indexOfFirstItem] = el)
                }
                onChange={(e) => handleMusicImageChange(e, indexOfFirstItem)}
              />

              <div className="form-layout-container">
                <div className="form-column form-column-left">
                  <div className="form-group">
                    <label>音乐封面 (可选)</label>
                    <div
                      className="image-upload-preview large"
                      onClick={() =>
                        musicImageInputRefs.current[indexOfFirstItem]?.click()
                      }
                    >
                      {currentMusicItem.imagePreview ? (
                        <img
                          src={currentMusicItem.imagePreview}
                          alt="音乐封面预览"
                        />
                      ) : (
                        <div className="upload-placeholder">
                          <FaPlus />
                          <span>点击上传封面</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-column form-column-right">
                  <div className="music-item-header-paginated">
                    <h4 title={currentMusicItem.musicFile.name}>
                      {currentMusicItem.musicFile.name}
                    </h4>
                    <button
                      type="button"
                      className="remove-item-button"
                      onClick={() => removeMusicItem(indexOfFirstItem)}
                    >
                      ×
                    </button>
                  </div>
                  {currentMusicItem.error && (
                    <p className="form-error item-error">
                      {currentMusicItem.error}
                    </p>
                  )}

                  <div className="form-group">
                    <label htmlFor={`music-name-${indexOfFirstItem}`}>
                      歌曲名称
                    </label>
                    <input
                      id={`music-name-${indexOfFirstItem}`}
                      type="text"
                      value={currentMusicItem.musicName}
                      onChange={(e) =>
                        handleMusicDataChange(
                          indexOfFirstItem,
                          "musicName",
                          e.target.value
                        )
                      }
                      disabled={currentMusicItem.isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`music-artist-${indexOfFirstItem}`}>
                      歌手
                    </label>
                    <input
                      id={`music-artist-${indexOfFirstItem}`}
                      type="text"
                      value={currentMusicItem.musicArtist}
                      onChange={(e) =>
                        handleMusicDataChange(
                          indexOfFirstItem,
                          "musicArtist",
                          e.target.value
                        )
                      }
                      disabled={currentMusicItem.isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`music-album-${indexOfFirstItem}`}>
                      专辑 (可选)
                    </label>
                    <input
                      id={`music-album-${indexOfFirstItem}`}
                      type="text"
                      value={currentMusicItem.musicAlbum}
                      onChange={(e) =>
                        handleMusicDataChange(
                          indexOfFirstItem,
                          "musicAlbum",
                          e.target.value
                        )
                      }
                      disabled={currentMusicItem.isLoading}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor={`music-genre-${indexOfFirstItem}`}>
                        风格
                      </label>
                      <input
                        id={`music-genre-${indexOfFirstItem}`}
                        type="text"
                        value={currentMusicItem.musicGenre}
                        onChange={(e) =>
                          handleMusicDataChange(
                            indexOfFirstItem,
                            "musicGenre",
                            e.target.value
                          )
                        }
                        disabled={currentMusicItem.isLoading}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`music-year-${indexOfFirstItem}`}>
                        年份
                      </label>
                      <input
                        id={`music-year-${indexOfFirstItem}`}
                        type="text"
                        value={currentMusicItem.musicYear}
                        onChange={(e) =>
                          handleMusicDataChange(
                            indexOfFirstItem,
                            "musicYear",
                            e.target.value
                          )
                        }
                        disabled={currentMusicItem.isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="empty-state-message">请先选择音乐文件以上传。</p>
          )}

          {pageCount > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="form-button-secondary"
                onClick={() => setModalCurrentPage((p) => Math.max(1, p - 1))}
                disabled={modalCurrentPage === 1}
              >
                上一首
              </button>

              {paginationItems.map((item, index) => {
                if (item === DOTS) {
                  return (
                    <span key={`${item}-${index}`} className="pagination-dots">
                      {DOTS}
                    </span>
                  );
                }
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setModalCurrentPage(item)}
                    className={`form-button-secondary ${
                      modalCurrentPage === item ? "active" : ""
                    }`}
                  >
                    {item}
                  </button>
                );
              })}

              <button
                type="button"
                className="form-button-secondary"
                onClick={() =>
                  setModalCurrentPage((p) => Math.min(pageCount, p + 1))
                }
                disabled={modalCurrentPage === pageCount}
              >
                下一首
              </button>
            </div>
          )}

          {shareError && <p className="form-error">{shareError}</p>}
          <button
            type="submit"
            className="form-button"
            disabled={isSharingMusic || newMusics.length === 0}
          >
            {isSharingMusic
              ? "正在添加..."
              : `确认添加 ${newMusics.length} 首音乐`}
          </button>
        </form>
      </EditModal>
    </>
  );
};

export default CollectionInfo;
