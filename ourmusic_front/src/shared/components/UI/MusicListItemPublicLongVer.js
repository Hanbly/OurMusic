import React, { useState, useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import { FaRegStar, FaStar, FaPlus, FaPlay } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { AiOutlineComment } from "react-icons/ai";

import DropdownMenuContent from "../../../shared/components/UI/DropdownMenuContent";
import EditModal from "../EditModal/EditModal";
import CollectionModal from "../EditModal/CollectModal";
import { AuthContext } from "../../../context/auth-context";
import { useAudio } from "../../../context/audio-context";
import axiosClient from "../../../api-config";
import axiosDownload from "../../../api-config-download";

import "./MusicListItemPublicLongVer.css";

const MusicListItemPublicLongVer = (props) => {
  const { music, musicList, width = "800px" } = props;
  const { playTrack, addTrackToList, currentTrack, isPlaying } = useAudio();
  const auth = useContext(AuthContext);

  const isOwner = auth.userId && music.userId === auth.userId;
  const isThisTrackPlaying =
    currentTrack?.musicId === music.musicId && isPlaying;

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [likeCount, setLikeCount] = useState(music.musicLikedCount);
  const [dislikeCount, setDislikeCount] = useState(music.musicDislikedCount);
  const [collectCount, setCollectCount] = useState(music.musicCollectedCount);
  const [commentCount] = useState(music.musicCommentedCount);

  const [isInteracting, setIsInteracting] = useState(false);

  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const [editedMusicName, setEditedMusicName] = useState(music.musicName);
  const [editedMusicArtist, setEditedMusicArtist] = useState(music.musicArtist);
  const [editedMusicAlbum, setEditedMusicAlbum] = useState(music.musicAlbum);
  const [editedMusicGenre, setEditedMusicGenre] = useState(music.musicGenre);
  const [editedMusicYear, setEditedMusicYear] = useState(music.musicYear);
  const [editedMusicImageFile, setEditedMusicImageFile] = useState(null);
  const [editedMusicImagePreview, setEditedMusicImagePreview] = useState(
    music.musicImageFileUrl
  );
  const editImageInputRef = useRef(null);

  const handleLikeClick = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    axiosClient
      .post(`/api/data-stats/like/MUSIC/${music.musicId}/user/${auth.userId}`)
      .then((response) => {
        if (response.data.message === "点赞成功") {
          setIsLiked(true);
          setLikeCount((prev) => prev + 1);
          if (isDisliked) {
            handleDislikeClick();
            setIsDisliked(false);
          }
        } else if (response.data.message === "取消点赞成功") {
          setIsLiked(false);
          setLikeCount((prev) => prev - 1);
        }
      })
      .catch((error) => console.error("点赞/取消点赞失败:", error))
      .finally(() => setIsInteracting(false));
  };

  const handleDislikeClick = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    axiosClient
      .post(
        `/api/data-stats/dislike/MUSIC/${music.musicId}/user/${auth.userId}`
      )
      .then((response) => {
        if (response.data.message === "点踩成功") {
          setIsDisliked(true);
          setDislikeCount((prev) => prev + 1);
          if (isLiked) {
            handleLikeClick();
            setIsLiked(false);
          }
        } else if (response.data.message === "取消点踩成功") {
          setIsDisliked(false);
          setDislikeCount((prev) => prev - 1);
        }
      })
      .catch((error) => console.error("点踩/取消点踩失败:", error))
      .finally(() => setIsInteracting(false));
  };

  const handleFavoriteClick = () => {
    axiosClient
      .put(
        `/api/data-stats/collect/MUSIC/${music.musicId}/user/${auth.userId}/default`
      )
      .then((response) => {
        if (response.data.message === "音乐加入默认歌单成功") {
          setIsCollected(true);
          setCollectCount((prev) => prev + 1);
        } else if (response.data.message === "音乐取消加入默认歌单成功") {
          setIsCollected(false);
          setCollectCount((prev) => prev - 1);
        }
      })
      .catch((error) => console.error("收藏/取消收藏失败:", error));
  };

  const handleCollectSuccess = () => {
    setIsCollected(true);
    setCollectCount((prev) => prev + 1);
  };

  const handlePlayAndRecordHistory = (musicTrack, trackList) => {
    playTrack(musicTrack, trackList, auth.userId);
  };

  const handleEditImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditedMusicImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedMusicImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    let editedMusicImageFileId;
    let editedMusicImageFileUrl;
    if (editedMusicImageFile) {
      const imageFormData = new FormData();
      imageFormData.append("file", editedMusicImageFile);
      const imageUploadRes = await axiosClient.post(
        "/api/files/upload",
        imageFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (imageUploadRes.data.code === 200) {
        editedMusicImageFileId = imageUploadRes.data.data.customFileId;
        editedMusicImageFileUrl = imageUploadRes.data.data.fileUrl;
      }
    }
    const musicUpdatedData = {
      musicId: music.musicId,
      musicName: editedMusicName,
      musicArtist: editedMusicArtist,
      musicAlbum: editedMusicAlbum,
      musicGenre: editedMusicGenre,
      musicYear: editedMusicYear,
      musicImageFileId: editedMusicImageFileId,
      musicImageFileUrl: editedMusicImageFileUrl,
      userId: auth.userId,
    };
    axiosClient.put(`/api/music`, musicUpdatedData);
    setShowEditModal(false);
  };

  const handleDeleteConfirm = (event) => {
    event.preventDefault();
    axiosClient.delete(`/api/music/${music.musicId}`).then(() => {
      setShowDeleteModal(false);
      window.location.reload();
    });
    setShowDeleteModal(false);
  };

  const handleDownloadConfirm = () => {
    axiosDownload
      .get(
        `${music.musicFileUrl}?musicId=${music.musicId}&userId=${auth.userId}`,
        {
          responseType: "blob",
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${music.musicName}${getFileExtensionWithRegex(music.musicFileUrl)}`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    setShowDownloadModal(false);
  };

  function getFileExtensionWithRegex(filename) {
    if (typeof filename !== "string") {
      return "";
    }
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0] : "";
  }

  const handleAddToPlaylist = (track) => {
    addTrackToList(track);
  };

  const handleCollect = () => {
    setShowCollectionModal(true);
  };

  const handleShare = () => {
    alert("分享功能待实现");
  };

  const handleEdit = () => {
    setEditedMusicName(music.musicName);
    setEditedMusicArtist(music.musicArtist);
    setEditedMusicAlbum(music.musicAlbum);
    setEditedMusicGenre(music.musicGenre);
    setEditedMusicYear(music.musicYear);
    setEditedMusicImagePreview(music.musicImageFileUrl);
    setEditedMusicImageFile(null);
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
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

  return (
    <li className="long-music-item" style={{ width: width }}>
      <CollectionModal
        show={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        music={music}
        userId={auth.userId}
        onSuccess={handleCollectSuccess}
      />

      <EditModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑歌曲信息"
      >
        <form onSubmit={handleEditSubmit} className="edit-music-form">
          <div className="form-layout-container">
            <div className="form-column form-column-left">
              <div className="form-group">
                <label>音乐封面 (可选)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={editImageInputRef}
                  onChange={handleEditImageChange}
                  style={{ display: "none" }}
                />
                <div
                  className="image-upload-preview large"
                  onClick={() => editImageInputRef.current.click()}
                >
                  {editedMusicImagePreview ? (
                    <img src={editedMusicImagePreview} alt="音乐封面预览" />
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
              <div className="form-group">
                <label htmlFor="music-name">音乐名称</label>
                <input
                  id="music-name"
                  type="text"
                  value={editedMusicName}
                  onChange={(e) => setEditedMusicName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="music-artist">艺术家</label>
                <input
                  id="music-artist"
                  type="text"
                  value={editedMusicArtist}
                  onChange={(e) => setEditedMusicArtist(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="music-album">专辑 (可选)</label>
                <input
                  id="music-album"
                  type="text"
                  value={editedMusicAlbum}
                  onChange={(e) => setEditedMusicAlbum(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="music-genre">风格</label>
                  <input
                    id="music-genre"
                    type="text"
                    value={editedMusicGenre}
                    onChange={(e) => setEditedMusicGenre(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="music-year">年份</label>
                  <input
                    id="music-year"
                    type="text"
                    value={editedMusicYear}
                    onChange={(e) => setEditedMusicYear(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="form-button">
            确认修改
          </button>
        </form>
      </EditModal>

      <EditModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
      >
        <div className="confirmation-dialog">
          <p>您确定要删除歌曲《{music.musicName}》吗？此操作无法撤销。</p>
          <div className="confirmation-actions">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="form-button-cancel"
            >
              取消
            </button>
            <button onClick={handleDeleteConfirm} className="form-button">
              确认删除
            </button>
          </div>
        </div>
      </EditModal>

      <EditModal
        show={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="准备下载"
      >
        <div className="confirmation-dialog">
          <p>您将要下载歌曲《{music.musicName}》。</p>
          <div className="confirmation-actions">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="form-button-cancel"
            >
              取消
            </button>
            <button onClick={handleDownloadConfirm} className="form-button">
              开始下载
            </button>
          </div>
        </div>
      </EditModal>

      <div
        className="long-music-item__image"
        onClick={() => handlePlayAndRecordHistory(music, musicList)}
      >
        <img src={music.musicImageFileUrl} alt={music.musicName} />
        <div className={`play-overlay ${isThisTrackPlaying ? "playing" : ""}`}>
          {!isThisTrackPlaying ? (
            <FaPlay />
          ) : (
            <div className="sound-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>

      <div className="long-music-item__info long-music-item__info--name">
        <Link
          to={auth.userId ? `/${music.musicId}/musicInfo` : ""}
          className="long-music-item__link"
          onClick={(e) => {
            if (!auth.userId) {
              e.preventDefault();
              auth.openLoginModal();
            }
          }}
        >
          <span
            title={music.musicName}
            className={`title ${isThisTrackPlaying ? "playing" : ""}`}
          >
            {music.musicName}
          </span>
        </Link>
      </div>

      <div className="long-music-item__info long-music-item__info--artist">
        <span className="artist" title={music.musicArtist}>
          {music.musicArtist}
        </span>
      </div>
      <div className="long-music-item__info long-music-item__info--album">
        <span className="artist" title={music.musicAlbum}>
          {music.musicAlbum}
        </span>
      </div>

      <div className="long-music-item__actions">
        <button
          className="icon-button"
          disabled={isInteracting}
          onClick={() => {
            if (!auth.userId) {
              auth.openLoginModal();
            } else if (isOwner) {
              alert("不能点赞自己分享的歌曲哦！");
            } else {
              handleLikeClick();
            }
          }}
        >
          <span className="count-display">{likeCount}</span>
          {isLiked ? <BiSolidLike /> : <BiLike />}
        </button>

        <button
          className="icon-button"
          disabled={isInteracting}
          onClick={() => {
            if (!auth.userId) {
              auth.openLoginModal();
            } else if (isOwner) {
              alert("不能点踩自己分享的歌曲哦！");
            } else {
              handleDislikeClick();
            }
          }}
        >
          <span className="count-display">{dislikeCount}</span>
          {isDisliked ? <BiSolidDislike /> : <BiDislike />}
        </button>

        <button
          className="icon-button"
          onClick={auth.userId ? handleFavoriteClick : auth.openLoginModal}
        >
          <span className="count-display">{collectCount}</span>
          {isCollected ? <FaStar /> : <FaRegStar />}
        </button>

        <Link className="icon-button" to={`/${music.musicId}/musicInfo`}>
          <span className="count-display">{commentCount}</span>
          <AiOutlineComment />
        </Link>

        <div className="long-music-item__menu-container">
          <button
            ref={triggerRef}
            className="icon-button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <BsThreeDots />
          </button>
          {isMenuOpen &&
            createPortal(
              <div
                style={{
                  position: "absolute",
                  top: `${
                    triggerRef.current?.getBoundingClientRect().bottom +
                    window.scrollY +
                    5
                  }px`,
                  left: `${
                    triggerRef.current?.getBoundingClientRect().left +
                    window.scrollX
                  }px`,
                  zIndex: 1100,
                }}
              >
                <DropdownMenuContent
                  ref={menuRef}
                  music={music}
                  isOwner={isOwner}
                  onClose={() => setIsMenuOpen(false)}
                  onAddToPlaylist={handleAddToPlaylist}
                  onCollect={handleCollect}
                  onShare={handleShare}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                />
              </div>,
              document.getElementById("portal-root")
            )}
        </div>
      </div>
    </li>
  );
};

export default MusicListItemPublicLongVer;
