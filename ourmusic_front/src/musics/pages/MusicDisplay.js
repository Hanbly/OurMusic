import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import axiosClient from "../../api-config";

// 引入我们已经创建好的通用组件
import SidePanel from "../../shared/components/SidePanel/SidePanel"; 
import MusicInfo from "./MusicInfo"; // 这是我们之前重构好的、包含左右布局的详情/评论组件
import { FaCompactDisc } from "react-icons/fa";

import "./MusicDisplay.css";

const MusicDisplay = () => {
  const { musicId } = useParams();
  const history = useHistory();

  const [musicData, setMusicData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // 当组件加载或 musicId 变化时，获取数据并打开面板
  useEffect(() => {
    // 如果没有 musicId，不执行任何操作
    if (!musicId) {
      history.goBack()
      return;
    }

    const fetchAndShowPanel = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(`/api/music/${musicId}`);
        const result = response.data;

        if (result && result.code === 200) {
          setMusicData(result.data);
          // 数据获取成功后，立即将面板状态设置为打开
          setIsPanelOpen(true); 
        } else {
          throw new Error(result.message || "未能获取歌曲详情");
        }
      } catch (err) {
        setError(err.message);
        // 如果出错，可以选择弹窗提示后返回
        alert(`加载失败: ${err.message}`);
        history.goBack()
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndShowPanel();
    
    // 这个 Effect 只依赖 musicId, 确保只在 ID 变化时重新获取
  }, [musicId, history]);

  // 关闭面板的处理函数
  const handleClosePanel = () => {
    // 1. 先设置状态，触发关闭动画
    setIsPanelOpen(false);

    // 2. 在动画（300ms）结束后，导航回上一页
    setTimeout(() => {
      history.goBack()
    }, 300);
  };

  // 处理评论添加成功后的状态更新
  const handleCommentAdded = (newComment) => {
    setMusicData((prevData) => ({
      ...prevData,
      commentsDto: [newComment, ...prevData.commentsDto],
      musicCommentedCount: prevData.musicCommentedCount + 1,
    }));
  };

  // 这个组件本身可以是一个“透明”的容器，只负责显示加载状态和SidePanel
  return (
    <div className="music-display-wrapper">
      {/* 在数据加载期间显示一个覆盖整个页面的加载提示 */}
      {isLoading && (
        <div className="loading-overlay">
          <FaCompactDisc className="spinner-icon" />
          <span>正在加载音乐信息...</span>
        </div>
      )}

      {/* 错误状态已经通过 alert 和 history.goBack() 处理，所以这里不需要特别的UI */}

      {/* SidePanel 的显隐完全由 isPanelOpen 状态控制 */}
      <SidePanel show={isPanelOpen} onClose={handleClosePanel}>
        {/* 确保在有数据时才渲染 MusicInfo 组件 */}
        {musicData && (
          <MusicInfo
            musicData={musicData}
            onClose={handleClosePanel}
            onCommentAdded={handleCommentAdded}
          />
        )}
      </SidePanel>
    </div>
  );
};

export default MusicDisplay;