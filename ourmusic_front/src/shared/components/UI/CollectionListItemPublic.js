import React, { useState, useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import { FaPlay, FaPlus, FaStar, FaRegStar } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { GrShareOption } from "react-icons/gr";
import { MdEdit, MdDelete } from "react-icons/md";
import { AiOutlineComment } from "react-icons/ai";

import EditModal from "../../../shared/components/EditModal/EditModal";
import { AuthContext } from "../../../context/auth-context";
import axiosClient from "../../../api-config";

import "./CollectionListItemPublic.css";

const CollectionListItemPublic = (props) => {
  const { collection, onPlayAll, width = "100%" } = props;
  const auth = useContext(AuthContext);
  const isOwner = auth.userId && collection.user?.userId === auth.userId;

  // --- 关键修改: 使用API返回的状态来初始化 ---
  const [isLiked, setIsLiked] = useState(collection.operateUserLikedOrNot);
  const [isDisliked, setIsDisliked] = useState(collection.operateUserDislikedOrNot);
  const [isCollected, setIsCollected] = useState(collection.operateUserCollectedOrNot);

  const [likeCount, setLikeCount] = useState(
    collection.collectionLikedCount || 0
  );
  const [dislikeCount, setDislikeCount] = useState(
    collection.collectionDislikedCount || 0
  );
  const [collectCount, setCollectCount] = useState(
    collection.collectionCollectedCount || 0
  );
  const [commentCount] = useState(collection.collectionCommentCount || 0);

  const [isInteracting, setIsInteracting] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [editedCollectionName, setEditedCollectionName] = useState("");
  const [editedCollectionDesc, setEditedCollectionDesc] = useState("");
  const [editedCollectionGenre, setEditedCollectionGenre] = useState("");
  const [editedIsPrivate, setEditedIsPrivate] = useState(
    collection.collectionStatus === "PRIVATE"
  );
  const [editedImageFile, setEditedImageFile] = useState(null);
  const [editedImagePreview, setEditedImagePreview] = useState(null);
  const [editError, setEditError] = useState("");
  const collectionFileInputRef = useRef(null);

  const handleLikeClick = () => {
    if (isInteracting) return;
    if (isOwner) {
      alert("不能点赞自己的歌单哦！");
      return;
    }
    setIsInteracting(true);
    axiosClient
      .post(
        `/api/data-stats/like/COLLECTION/${collection.collectionId}/user/${auth.userId}`
      )
      .then((response) => {
        if (response.data.message === "点赞成功") {
          setIsLiked(true);
          setLikeCount((prev) => prev + 1);
          if (isDisliked) {
            // 如果之前是点踩状态，取消点踩
             axiosClient
            .post(`/api/data-stats/dislike/COLLECTION/${collection.collectionId}/user/${auth.userId}`)
            .then(() => {
                setIsDisliked(false);
                setDislikeCount(prev => prev -1);
            });
          }
        } else if (response.data.message === "取消点赞成功") {
          setIsLiked(false);
          setLikeCount((prev) => prev - 1);
        }
      })
      .catch((err) => console.error("点赞操作失败:", err))
      .finally(() => setIsInteracting(false));
  };

  const handleDislikeClick = () => {
    if (isInteracting) return;
    if (isOwner) {
      alert("不能点踩自己的歌单哦！");
      return;
    }
    setIsInteracting(true);
    axiosClient
      .post(
        `/api/data-stats/dislike/COLLECTION/${collection.collectionId}/user/${auth.userId}`
      )
      .then((response) => {
        if (response.data.message === "点踩成功") {
          setIsDisliked(true);
          setDislikeCount((prev) => prev + 1);
          if (isLiked) {
             // 如果之前是点赞状态，取消点赞
            axiosClient
            .post(`/api/data-stats/like/COLLECTION/${collection.collectionId}/user/${auth.userId}`)
            .then(() => {
                setIsLiked(false);
                setLikeCount(prev => prev -1);
            });
          }
        } else if (response.data.message === "取消点踩成功") {
          setIsDisliked(false);
          setDislikeCount((prev) => prev - 1);
        }
      })
      .catch((err) => console.error("点踩操作失败:", err))
      .finally(() => setIsInteracting(false));
  };

  const handleCollectClick = () => {
    if (isOwner) {
      alert("不能收藏自己的歌单哦！");
      return;
    }
    // 假设是收藏到用户的默认收藏夹
    axiosClient
      .put(
        `/api/data-stats/collect/COLLECTION/${collection.collectionId}/user/${auth.userId}/default`
      )
      .then((response) => {
        if (response.data.message === "歌单加入默认收藏成功") {
          setIsCollected(true);
          setCollectCount((prev) => prev + 1);
        } else if (response.data.message === "歌单取消加入默认收藏成功") {
          setIsCollected(false);
          setCollectCount((prev) => prev - 1);
        }
      })
      .catch((err) => console.error("收藏/取消收藏歌单失败:", err));
  };

  const openEditModal = () => {
    setEditedCollectionName(collection.collectionName);
    setEditedCollectionDesc(collection.collectionDescription || "");
    setEditedCollectionGenre(collection.collectionGenre || "");
    setEditedIsPrivate(collection.collectionStatus === "PRIVATE");
    setEditedImageFile(null);
    setEditedImagePreview(collection.collectionImageFileUrl);
    setEditError("");
    setShowEditModal(true);
  };

  const handleCollectionImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editedCollectionName || !editedCollectionGenre) {
      setEditError("歌单名称和风格为必填项。");
      return;
    }
    setIsUpdating(true);
    setEditError("");
    try {
      let imageFileId = collection.collectionImageFileId;
      let imageUrl = collection.collectionImageFileUrl;

      if (editedImageFile) {
        const formData = new FormData();
        formData.append("file", editedImageFile);
        const uploadResponse = await axiosClient.post(
          "/api/files/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (
          uploadResponse.data.code === 200 &&
          uploadResponse.data.data.customFileId &&
          uploadResponse.data.data.fileUrl
        ) {
          imageFileId = uploadResponse.data.data.customFileId;
          imageUrl = uploadResponse.data.data.fileUrl;
        } else {
          throw new Error("图片上传失败");
        }
      }

      const updatedData = {
        collectionId: collection.collectionId,
        collectionName: editedCollectionName,
        collectionDescription: editedCollectionDesc,
        collectionImageFileId: imageFileId,
        collectionImageFileUrl: imageUrl,
        collectionGenre: editedCollectionGenre,
        collectionStatus: editedIsPrivate ? "PRIVATE" : "PUBLIC",
        collectionMusicsNumber: collection.collectionMusicsNumber,
        userId: auth.userId,
      };

      await axiosClient.put("/api/collection", updatedData);
      setShowEditModal(false);
      alert("歌单更新成功！");
      window.location.reload(); // 简单起见，直接刷新页面
    } catch (err) {
      setEditError(
        err.response?.data?.message || err.message || "更新歌单失败"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePlayAllClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (onPlayAll && collection.musics && collection.musics.length > 0) {
      onPlayAll(collection.musics);
    } else if (onPlayAll) {
      onPlayAll();
    }
  };

  const handleDeleteConfirm = () => {
    axiosClient
      .delete(`/api/collection/${collection.collectionId}/user/${auth.userId}`)
      .then(() => {
        setShowDeleteModal(false);
        window.location.reload();
      })
      .catch((err) => console.error("删除失败:", err));
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const DropdownMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const menuStyles = {
      position: "fixed",
      top: `${rect.bottom + 5}px`,
      left: `${rect.left}px`,
      zIndex: 1100,
    };
    return createPortal(
      <ul className="dropdown-menu" ref={menuRef} style={menuStyles}>
        <li
          onClick={() => {
            alert("分享功能待实现");
            setIsMenuOpen(false);
          }}
        >
          <GrShareOption /> 分享
        </li>
        {isOwner && (
          <>
            <li
              onClick={() => {
                openEditModal();
                setIsMenuOpen(false);
              }}
            >
              <MdEdit /> 编辑
            </li>
            <li
              onClick={() => {
                setShowDeleteModal(true);
                setIsMenuOpen(false);
              }}
            >
              <MdDelete /> 删除
            </li>
          </>
        )}
      </ul>,
      document.getElementById("portal-root")
    );
  };

  return (
    <>
      <EditModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="修改歌单信息"
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label>歌单封面 (可选)</label>
            <input
              type="file"
              accept="image/*"
              ref={collectionFileInputRef}
              onChange={handleCollectionImageChange}
              style={{ display: "none" }}
            />
            <div
              className="image-upload-preview"
              onClick={() => collectionFileInputRef.current.click()}
            >
              {editedImagePreview ? (
                <img src={editedImagePreview} alt="预览" />
              ) : (
                <div className="upload-placeholder">
                  <FaPlus />
                  <span>点击上传封面</span>
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="name-edit-collection">歌单名称</label>
            <input
              id="name-edit-collection"
              type="text"
              value={editedCollectionName}
              onChange={(e) => setEditedCollectionName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="genre-edit-collection">歌单风格</label>
            <input
              id="genre-edit-collection"
              type="text"
              value={editedCollectionGenre}
              onChange={(e) => setEditedCollectionGenre(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="desc-edit-collection">歌单描述</label>
            <input
              id="desc-edit-collection"
              type="text"
              value={editedCollectionDesc}
              onChange={(e) => setEditedCollectionDesc(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div className="toggle-switch-container">
              <label htmlFor="private-edit-collection">设为私密</label>
              <label className="toggle-switch">
                <input
                  id="private-edit-collection"
                  type="checkbox"
                  checked={editedIsPrivate}
                  onChange={(e) => setEditedIsPrivate(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          {editError && <p className="form-error">{editError}</p>}
          <button type="submit" className="form-button" disabled={isUpdating}>
            {isUpdating ? "正在更新..." : "确认更新"}
          </button>
        </form>
      </EditModal>

      <EditModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
      >
        <div className="confirmation-dialog">
          <p>
            您确定要删除歌单《{collection.collectionName}》吗？此操作无法撤销。
          </p>
          <div className="confirmation-actions">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="form-button-cancel"
            >
              取消
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="form-button-danger"
            >
              确认删除
            </button>
          </div>
        </div>
      </EditModal>

      <li className="collection-list-item-public" style={{ width: width }}>
        <div className="collection-list-item-public__image">
          <img
            src={collection.collectionImageFileUrl}
            alt={collection.collectionName}
          />
          <button className="play-overlay-button" onClick={handlePlayAllClick}>
            <FaPlay className="play-icon" />
          </button>
        </div>

        <div className="collection-list-item-public__info">
          <Link
            to={`/${collection.collectionId}/collectionInfo`}
            className="collection-list-item-public__link"
          >
            <span className="title">{collection.collectionName}</span>
          </Link>
          <span className="collector">
            {collection.collectionMusicsNumber &&
            collection.collectionMusicsNumber > 0
              ? ` ${collection.collectionMusicsNumber}首`
              : ""}
            {collection.user ? (
              <Link
                to={`/${collection.user.userId}/myMusics`}
                className="collection-list-item-public__link"
              >
                【创建者：
                {collection.user.userNickName
                  ? collection.user.userNickName
                  : collection.user.userName}
                】
              </Link>
            ) : (
              "【创建者：未知】"
            )}
          </span>
        </div>

        {collection.collectionName === "默认歌单" ? (
          ""
        ) : (
          <div className="collection-list-item-public__actions">
            <button
              className="icon-button"
              disabled={isInteracting}
              onClick={auth.userId ? handleLikeClick : auth.openLoginModal}
            >
              <span className="count-display">{likeCount}</span>
              {isLiked ? <BiSolidLike /> : <BiLike />}
            </button>
            <button
              className="icon-button"
              disabled={isInteracting}
              onClick={auth.userId ? handleDislikeClick : auth.openLoginModal}
            >
              <span className="count-display">{dislikeCount}</span>
              {isDisliked ? <BiSolidDislike /> : <BiDislike />}
            </button>

            <button
              className="icon-button"
              onClick={auth.userId ? handleCollectClick : auth.openLoginModal}
            >
              <span className="count-display">{collectCount}</span>
              {isCollected ? <FaStar /> : <FaRegStar />}
            </button>

            <Link
              className="icon-button"
              to={`/${collection.collectionId}/collectionInfo`}
            >
              <span className="count-display">{commentCount}</span>
              <AiOutlineComment />
            </Link>

            <div className="menu-container">
              <button
                ref={triggerRef}
                className="icon-button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <BsThreeDots />
              </button>
              {isMenuOpen && <DropdownMenu />}
            </div>
          </div>
        )}
      </li>
    </>
  );
};

export default CollectionListItemPublic;