import React, { useState, useRef } from "react";

import EditModal from "./EditModal";
import CollectionSelector from "../../../collects/components/CollectionSelector";
import axiosClient from "../../../api-config";

const CollectModal = ({ show, onClose, music, userId, onSuccess }) => {
  const initialCollectionsState = useRef([]);
  const [currentCollections, setCurrentCollections] = useState([]);
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    initialCollectionsState.current = [];
    setCurrentCollections([]);
    setError("");
    setIsSubmitting(false);
    onClose();
  };

  const handleSelectionChange = (collections) => {
    if (initialCollectionsState.current.length === 0) {
      initialCollectionsState.current = collections;
    }
    setCurrentCollections(collections);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    // 找出状态发生变化的歌单 (使用 find 确保匹配正确)
    const collectionsToUpdate = currentCollections.filter((current) => {
        const initial = initialCollectionsState.current.find(c => c.id === current.id);
        return initial && current.isCollected !== initial.isCollected;
    });

    if (collectionsToUpdate.length === 0) {
        handleClose(); // 没有变化，直接关闭
        return;
    }

    // --- 关键修改 1: 将变更分类 ---
    const collectionsToAdd = collectionsToUpdate.filter(c => c.isCollected);
    const collectionsToRemove = collectionsToUpdate.filter(c => !c.isCollected);
    
    const promises = collectionsToUpdate.map(collection => {
        if (collection.isCollected) {
            // 添加收藏 API
            return axiosClient.put(`/api/data-stats/collect/MUSIC/${music.musicId}/user/${userId}/to-collection/${collection.id}`);
        } else {
            // 删除收藏 API
            return axiosClient.put(`/api/data-stats/d-collect/MUSIC/${music.musicId}/user/${userId}/out-collection/${collection.id}`);
        }
    });

    try {
        await Promise.all(promises);
        
        // --- 关键修改 2: 构建动态的、更智能的成功提示 ---
        let successMessage = "";
        if (collectionsToAdd.length > 0 && collectionsToRemove.length > 0) {
            successMessage = "收藏状态更新成功！";
        } else if (collectionsToAdd.length > 0) {
            successMessage = `成功将歌曲《${music.musicName}》收藏到 ${collectionsToAdd.length} 个歌单！`;
        } else if (collectionsToRemove.length > 0) {
            successMessage = `成功从 ${collectionsToRemove.length} 个歌单中移出歌曲《${music.musicName}》！`;
        }

        if (successMessage) {
            alert(successMessage);
        }
        
        if (onSuccess) {
            onSuccess(); // 通知父组件成功了，父组件可以刷新收藏数等
        }
        handleClose();
    } catch (err) {
        setError(err.response?.data?.message || "更新收藏失败，请稍后再试");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <EditModal
      show={show}
      onClose={handleClose}
      title={`管理歌曲《${music.musicName}》的收藏`}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>选择要收藏到的歌单</label>
          <CollectionSelector
            userId={userId}
            musicId={music.musicId}
            onSelectionChange={handleSelectionChange}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="form-button" disabled={isSubmitting}>
          {isSubmitting ? "正在保存..." : "完成"}
        </button>
      </form>
    </EditModal>
  );
};

export default CollectModal;