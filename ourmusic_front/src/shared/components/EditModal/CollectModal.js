import React, { useState } from "react";

import EditModal from "./EditModal";
import CollectionSelector from "../../../collects/components/CollectionSelector";
import axiosClient from "../../../api-config";

/**
 * 一个封装了收藏逻辑的模态框组件
 * @param {object} props
 * @param {boolean} props.show - 是否显示模态框
 * @param {function} props.onClose - 关闭模态框的回调函数
 * @param {object} props.music - 需要被收藏的歌曲对象
 * @param {string} props.userId - 当前登录用户的ID
 * @param {function} props.onSuccess - 收藏成功后的回调函数
 */
const CollectionModal = ({ show, onClose, music, userId, onSuccess }) => {
  const [selectedCollectId, setSelectedCollectId] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当模态框关闭时，重置内部状态
  const handleClose = () => {
    setSelectedCollectId(null);
    setError("");
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedCollectId) {
      setError("请先选择一个歌单！");
      return;
    }
    setIsSubmitting(true);
    setError("");

    axiosClient
      .put(`/api/data-stats/collect/MUSIC/${music.musicId}/user/${userId}/to-collection/${selectedCollectId}`)      
      .then((response) => {
        // 调用父组件传入的成功回调，通知父组件更新UI
        if (onSuccess) {
          onSuccess(response.data); 
        }
        handleClose(); // 关闭模态框
      })
      .catch((err) => {
        setError(err.response?.data?.message || "收藏失败，请稍后再试");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <EditModal
      show={show}
      onClose={handleClose}
      title={`收藏歌曲《${music.musicName}》`}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>选择歌单</label>
          <CollectionSelector
            userId={userId}
            onCollectionSelect={(id) => setSelectedCollectId(id)}
            selectedCollectionId={selectedCollectId}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="form-button" disabled={isSubmitting}>
          {isSubmitting ? "收藏中..." : "确认收藏"}
        </button>
      </form>
    </EditModal>
  );
};

export default CollectionModal;