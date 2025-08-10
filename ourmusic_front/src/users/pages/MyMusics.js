import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FaHistory, FaPlus } from "react-icons/fa";

import axiosClient from "../../../src/api-config";
import { AuthContext } from "../../context/auth-context";
// --- 关键修改 1: 引入正确的“哑”组件 MusicOutput ---
import MusicOutput from "../../musics/components/MusicOutput"; 
import CollectionOutput from "../../collects/components/CollectionOutput";
import EditModal from "../../shared/components/EditModal/EditModal";
import Pagination from "../../shared/components/UI/Pagination";
import "./MyMusics.css";

// --- 分页逻辑辅助函数 (仅用于Modal, 无需修改) ---
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


const MyMusics = () => {
  const auth = useContext(AuthContext);
  const { userId } = useParams();
  const isLoggedInUser = Number(userId) === auth.userId;

  const [user, setUser] = useState(null);
  const [userFetchError, setUserFetchError] = useState(null);
  const [activeOutput, setActiveOutput] = useState("Collection");
  
  // Modal state and functions (完全保留)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [newCollectionGenre, setNewCollectionGenre] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [createError, setCreateError] = useState("");
  const collectionFileInputRef = useRef(null);
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 1;

  const [outputData, setOutputData] = useState({
    Collection: {
      content: [],
      pageInfo: { number: 0, totalPages: 1, size: 5 },
      isLoading: true,
      error: null,
    },
    Marked: {
      content: [],
      pageInfo: { number: 0, totalPages: 1, size: 5 },
      isLoading: true,
      error: null,
    },
    Shared: {
      content: [],
      pageInfo: { number: 0, totalPages: 1, size: 4 },
      isLoading: true,
      error: null,
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosClient.get(`/api/user/${userId}`);
        setUser(response.data.data);
        setUserFetchError(null);
      } catch (err) {
        setUserFetchError(
          err.response?.data?.message || err.message || "获取用户信息失败"
        );
      }
    };
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (!user || auth.isAuthLoading) return;

    const activeState = outputData[activeOutput];
    const currentPageForAPI = activeState.pageInfo.number;
    const pageSize = activeState.pageInfo.size;

    let url = "";
    const params = {
      userId,
      page: currentPageForAPI,
      size: pageSize,
      sort: "desc",
      operateUserId: auth.userId || -1,
    };
    
    switch (activeOutput) {
      case "Collection":
        url = "/api/collection/batch-by-user";
        params.searchState = isLoggedInUser ? "private" : "public";
        break;
      case "Marked":
        url = "/api/collection/batch-by-user/marks";
        break;
      case "Shared":
        url = "/api/music/batch-by-user";
        break;
      default:
        return;
    }

    const fetchDataForActiveTab = async () => {
      setOutputData((prev) => ({
        ...prev,
        [activeOutput]: { ...prev[activeOutput], isLoading: true, error: null },
      }));

      try {
        const response = await axiosClient.get(url, { params });
        const result = response.data;
        
        // --- 关键修改 2: 修正API响应处理逻辑 ---
        if (result.code === 200) {
          const pageData = result.data;
          setOutputData((prev) => ({
            ...prev,
            [activeOutput]: {
              content: pageData?.content || [],
              pageInfo: {
                number: pageData?.number || 0,
                totalPages: pageData?.totalPages || 1,
                size: pageData?.size || pageSize,
              },
              isLoading: false,
              error: null, // 只要 code 是 200, error 就必须是 null
            },
          }));
        } else {
          // 如果 code 不是 200, 这才是业务逻辑上的失败
          throw new Error(result.message || "获取列表失败");
        }
      } catch (err) {
        // 捕获网络错误或上面抛出的业务错误
        const errorMessage = err.response?.data?.message || err.message || "加载数据失败";
        setOutputData((prev) => ({
          ...prev,
          [activeOutput]: {
            ...prev[activeOutput],
            content: [],
            isLoading: false,
            error: errorMessage,
          },
        }));
      }
    };

    fetchDataForActiveTab();
  }, [userId, user, activeOutput, outputData[activeOutput].pageInfo.number, auth.isAuthLoading, auth.userId]);
  

  const handlePageChange = (newPage) => {
    setOutputData((prev) => ({
      ...prev,
      [activeOutput]: {
        ...prev[activeOutput],
        pageInfo: {
          ...prev[activeOutput].pageInfo,
          number: newPage - 1,
        },
      },
    }));
  };

  const handleTabClick = (outputType) => {
    setActiveOutput(outputType);
  };
  
  // --- Modal 相关函数 (完全保留, 无需修改) ---
  const resetCollectionForm = () => {
    setNewCollectionName("");
    setNewCollectionDesc("");
    setNewCollectionGenre("");
    setIsPrivate(false);
    setImageFile(null);
    setImagePreview(null);
    setCreateError("");
  };

  const openCreateModal = () => {
    resetCollectionForm();
    setShowCreateModal(true);
  };

  const handleCollectionImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCollection = async (event) => {
    event.preventDefault();
    if (!newCollectionName || !newCollectionGenre) {
      setCreateError("歌单名称和风格为必填项。");
      return;
    }
    setIsCreatingCollection(true);
    setCreateError("");
    try {
      let imageFileId = null;
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResponse = await axiosClient.post(
          "/api/files/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
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
      const collectionData = {
        collectionName: newCollectionName,
        collectionDescription: newCollectionDesc,
        collectionImageFileId: imageFileId,
        collectionImageFileUrl: imageUrl,
        collectionGenre: newCollectionGenre,
        collectionStatus: isPrivate ? "PRIVATE" : "PUBLIC",
        userId: userId,
      };
      await axiosClient.post("/api/collection", collectionData);
      setShowCreateModal(false);
      alert("歌单创建成功！");
      if(activeOutput === "Collection") {
        setOutputData(prev => ({...prev, Collection: {...prev.Collection, pageInfo: {...prev.Collection.pageInfo, number: 0}}}));
      } else {
        setActiveOutput("Collection");
      }

    } catch (err) {
      setCreateError(
        err.response?.data?.message || err.message || "创建歌单失败"
      );
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const resetMusicForm = () => {
    setNewMusics([]);
    setShareError("");
    setCurrentPage(1);
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
      alert("请先选择一个统一封面。");
      return;
    }
    setNewMusics((prev) =>
      prev.map((music) => ({
        ...music,
        imageFile: unifiedImageFile,
        imagePreview: unifiedImagePreview,
      }))
    );
    alert("统一封面已应用到所有歌曲。");
  };

  const applyUnifiedImageToThis = () => {
    if (!unifiedImageFile || !unifiedImagePreview) {
      alert("请先选择一个统一封面。");
      return;
    }
    const currentIndex = currentPage - 1;
    setNewMusics((prev) => {
      const updatedMusics = [...prev];
      if (updatedMusics[currentIndex]) {
        updatedMusics[currentIndex].imageFile = unifiedImageFile;
        updatedMusics[currentIndex].imagePreview = unifiedImagePreview;
      }
      return updatedMusics;
    });
    alert(`封面已应用到当前第 ${currentPage} 首歌曲。`);
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
    setCurrentPage(initialLength + 1);
    const musicDataPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axiosClient.post("/api/files/preview", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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
    setCurrentPage((prev) => Math.max(1, Math.min(prev, newMusics.length - 1)));
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
        setCurrentPage(index + 1);
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
          userId: userId,
        };
      });
      const batchData = await Promise.all(uploadPromises);
      await axiosClient.post("/api/music/batch", batchData);
      setShowShareModal(false);
      alert(`成功分享 ${batchData.length} 首音乐！`);
      if (activeOutput === 'Shared') {
        setOutputData(prev => ({...prev, Shared: {...prev.Shared, pageInfo: {...prev.Shared.pageInfo, number: 0}}}));
      } else {
        setActiveOutput('Shared');
      }

    } catch (err) {
      setShareError(err.response?.data?.message || err.message || "分享音乐失败");
    } finally {
      setIsSharingMusic(false);
    }
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentMusicItem = newMusics[indexOfFirstItem];
  const pageCount = Math.ceil(newMusics.length / ITEMS_PER_PAGE);
  const paginationItems = getPaginationItems(currentPage, pageCount);


  if ((!user && !userFetchError) || auth.isAuthLoading) {
    return <div className="my-musics-status">加载中...</div>;
  }
  if (userFetchError) {
    return <div className="my-musics-status error">错误: {userFetchError}</div>;
  }
  if (!user) {
    return <div className="my-musics-status">未找到用户信息。</div>;
  }
  
  const activeData = outputData[activeOutput];

  return (
    <>
      <div className="my-musics">
        <div className="profile-card">
          <img
            src={user.userAvatarFileUrl}
            alt={`${user.userNickName || user.userName}的头像`}
            className="profile-card__avatar"
          />
          <div className="profile-card__info">
            <h2 className="profile-card__name">{user.userNickName || user.userName}</h2>
            <p className="profile-card__description">
              {user.userDescription || "这个人很懒，什么都没有写..."}
            </p>
          </div>
          {isLoggedInUser && (
            <Link
              to={`/${userId}/historyInfo`}
              className="profile-card__history-button"
            >
              <FaHistory />
              <span>历史记录</span>
            </Link>
          )}
        </div>

        <div className="musics-output-container">
          <div className="musics-output__tabs with-button">
            <div className="tabs-nav">
              <button
                className={`musics-output__button ${
                  activeOutput === "Collection" ? "active" : ""
                }`}
                onClick={() => handleTabClick("Collection")}
              >
                创建的歌单
              </button>
              {isLoggedInUser && (
                <button
                  className={`musics-output__button ${
                    activeOutput === "Marked" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("Marked")}
                >
                  收藏的歌单
                </button>
              )}
              <button
                className={`musics-output__button ${
                  activeOutput === "Shared" ? "active" : ""
                }`}
                onClick={() => handleTabClick("Shared")}
              >
                分享的音乐
              </button>
            </div>
            {isLoggedInUser && (
              <div className="action-buttons-group">
                <button className="create-button" onClick={openCreateModal}>
                  <FaPlus />
                  <span>创建歌单</span>
                </button>
                <button className="create-button" onClick={openShareModal}>
                  <FaPlus />
                  <span>分享音乐</span>
                </button>
              </div>
            )}
          </div>

          <div className="musics-output__content">
            {activeOutput === "Collection" && (
              <CollectionOutput
                collections={activeData.content}
                isLoading={activeData.isLoading}
                error={activeData.error}
                userId={userId}
                userName={user.userName}
                userNickName={user.userNickName}
                searchState={isLoggedInUser ? "private" : "public"}
                collectionKey="Collection"
                width="770px"
              />
            )}
            {activeOutput === "Marked" && isLoggedInUser && (
              <CollectionOutput
                collections={activeData.content}
                isLoading={activeData.isLoading}
                error={activeData.error}
                userId={userId}
                userName={user.userName}
                userNickName={user.userNickName}
                collectionKey="Marked"
                width="770px"
              />
            )}
            {activeOutput === "Shared" && (
              // --- 关键修改 3: 使用正确的组件和 props ---
              <MusicOutput
                musics={activeData.content}
                isLoading={activeData.isLoading}
                error={activeData.error}
                musicKey="Shared" // 传递 musicKey 以便 MusicOutput 内部渲染正确的列表
                title="分享的音乐"
                width="850px"
              />
            )}
          </div>

          {!activeData.isLoading && activeData.content && activeData.content.length > 0 && (
            <Pagination
              currentPage={activeData.pageInfo.number + 1}
              totalPages={activeData.pageInfo.totalPages}
              onPageChange={handlePageChange}
            />
          )}

        </div>
      </div>

      {/* Modal 弹窗保持不变 */}
      <EditModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建新的歌单"
      >
        <form onSubmit={handleCreateCollection}>
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
              {imagePreview ? (
                <img src={imagePreview} alt="预览" />
              ) : (
                <span>点击上传封面</span>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="name-mymusics">歌单名称</label>
            <input
              id="name-mymusics"
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="genre-mymusics">歌单风格</label>
            <input
              id="genre-mymusics"
              type="text"
              value={newCollectionGenre}
              onChange={(e) => setNewCollectionGenre(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="desc-mymusics">歌单描述</label>
            <input
              id="desc-mymusics"
              type="text"
              value={newCollectionDesc}
              onChange={(e) => setNewCollectionDesc(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div className="toggle-switch-container">
              <label htmlFor="private-mymusics">设为私密</label>
              <label className="toggle-switch">
                <input
                  id="private-mymusics"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          {createError && <p className="form-error">{createError}</p>}
          <button
            type="submit"
            className="form-button"
            disabled={isCreatingCollection}
          >
            {isCreatingCollection ? "正在创建..." : "确认创建"}
          </button>
        </form>
      </EditModal>

      <EditModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="分享新的音乐"
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
                ref={(el) => (musicImageInputRefs.current[indexOfFirstItem] = el)}
                onChange={(e) => handleMusicImageChange(e, indexOfFirstItem)}
              />

              <div className="form-layout-container">
                <div className="form-column form-column-left">
                  <div className="form-group">
                    <label>音乐封面 (可选)</label>
                    <div
                      className="image-upload-preview large"
                      onClick={() => musicImageInputRefs.current[indexOfFirstItem]?.click()}
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
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
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
                    onClick={() => setCurrentPage(item)}
                    className={`form-button-secondary ${
                      currentPage === item ? "active" : ""
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
                  setCurrentPage((p) => Math.min(pageCount, p + 1))
                }
                disabled={currentPage === pageCount}
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
              ? "正在分享..."
              : `确认分享 ${newMusics.length} 首音乐`}
          </button>
        </form>
      </EditModal>
    </>
  );
};

export default MyMusics;