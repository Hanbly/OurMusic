// src/collects/components/CollectionSelector.js

import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../../api-config";
import EditModal from "../../shared/components/EditModal/EditModal";
import "./CollectionSelector.css";

const fetchUserCollections = async (userId) => {
  if (!userId) return [];
  try {
    const response = await axiosClient.get(`/api/collection/batch-by-user`, { params: { userId, searchState: "private" } });
    const result = response.data;
    if (result && result.code === 200 && Array.isArray(result.data)) {
      return result.data.map((collection) => ({
        id: collection.collectionId,
        name: collection.collectionName,
        image: collection.collectionImageFileUrl,
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return [];
  }
};

const CollectionSelector = ({ userId, onCollectionSelect, selectedCollectionId }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [newCollectionGenre, setNewCollectionGenre] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const loadCollections = async () => {
    setLoading(true);
    const data = await fetchUserCollections(userId);
    setCollections(data);
    setLoading(false);
  };
  
  useEffect(() => {
    loadCollections();
  }, [userId]);

  const resetForm = () => {
    setNewCollectionName("");
    setNewCollectionDesc("");
    setNewCollectionGenre("");
    setIsPrivate(false);
    setImageFile(null);
    setImagePreview(null);
    setError("");
  };
  
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateCollection = async (event) => {
    event.preventDefault();
    if (!newCollectionName || !newCollectionGenre) {
      setError("歌单名称和风格为必填项。");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let imageFileId = null;
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await axiosClient.post("/api/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadResponse.data.code === 200 && uploadResponse.data.data.customFileId && uploadResponse.data.data.fileUrl) {
          imageFileId = uploadResponse.data.data.customFileId;
          imageUrl = uploadResponse.data.data.fileUrl;
        } else {
          throw new Error("图片上传失败，未返回URL。");
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

      const createResponse = await axiosClient.post("/api/collection", collectionData);

      if (createResponse.data.code === 200) {
        setShowCreateModal(false);
        const newCollection = createResponse.data.data;
        onCollectionSelect(newCollection.collectionId); 
        await loadCollections();
      } else {
        setError(createResponse.data.message || "创建歌单时发生未知错误。");
      }
    } catch (err) {
      console.error("Error creating collection:", err);
      setError(err.response?.data?.message || "创建歌单失败，请检查网络或联系管理员。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <EditModal show={showCreateModal} onClose={() => setShowCreateModal(false)} title="创建新的歌单">
        <form onSubmit={handleCreateCollection}>
          <div className="form-group">
            <label>歌单封面 (可选)</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <div className="image-upload-preview" onClick={() => fileInputRef.current.click()}>
              {imagePreview ? <img src={imagePreview} alt="预览" /> : <span>点击上传</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="name">歌单名称</label>
            <input id="name" type="text" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="genre">歌单风格</label>
            <input id="genre" type="text" value={newCollectionGenre} onChange={(e) => setNewCollectionGenre(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="desc">歌单描述</label>
            <input id="desc" type="text" value={newCollectionDesc} onChange={(e) => setNewCollectionDesc(e.target.value)} />
          </div>
          
          <div className="form-group">
            <div className="toggle-switch-container">
              <label htmlFor="private">设为私密</label>
              <label className="toggle-switch">
                <input id="private" type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="form-button" disabled={isSubmitting}>
            {isSubmitting ? "正在创建..." : "确认创建"}
          </button>
        </form>
      </EditModal>

      <ul className="collection-selector-list">
        {loading ? (
          <div className="selector-status">正在加载您的歌单...</div>
        ) : collections.length > 0 ? (
          collections.map((collection) => (
            <li 
              key={collection.id} 
              onClick={() => onCollectionSelect(collection.id)} 
              className={`collection-selector-item ${selectedCollectionId === collection.id ? "selected" : ""}`}
            >
              <img src={collection.image} alt={collection.name} className="collection-selector-item__image" />
              <span className="collection-selector-item__name">{collection.name}</span>
            </li>
          ))
        ) : (
          <div className="selector-status">您还没有创建任何歌单。</div>
        )}
        <li className="collection-selector-item create-new" onClick={openCreateModal}>
          + 创建新歌单
        </li>
      </ul>
    </>
  );
};

export default CollectionSelector;