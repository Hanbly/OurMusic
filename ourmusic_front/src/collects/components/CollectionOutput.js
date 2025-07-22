import React, { useState, useEffect } from "react";
import MusicCollectionList from "../../collects/components/CollectionList"; // 确保此组件路径正确
import axiosClient from "../../api-config";
import "./CollectionOutput.css";

const fetchCollections = async (userId, searchState, collectionKey) => {
  
  let url = '';
  const params = { userId };

  // 根据 collectionKey 的值，决定使用哪个API地址和参数
  if (collectionKey === "Marked") {
    // 这是 "我收藏的歌单" 的情况
    url = `/api/collection/batch-by-user/marks`;
  } else {
    // 这是默认情况，即您原有的 "收藏" (自己创建的)
    url = `/api/collection/batch-by-user`;
    params.searchState = searchState; // 这个API需要额外的searchState参数
  }

  try {
    // 使用动态的 url 和 params 来发送请求
    const response = await axiosClient.get(url, { params });
    const result = response.data;

    if (result && result.code === 200 && Array.isArray(result.data)) {
      // 数据处理逻辑保持不变
      return result.data.map((collection) => ({
        collectionId: collection.collectionId,
        collectionName: collection.collectionName,
        collectionDescription: collection.collectionDescription,
        collectionGenre: collection.collectionGenre,
        collectionImageFileUrl: collection.collectionImageFileUrl,
        collectionMusicsNumber: collection.collectionMusicsNumber,
        collectionLikedCount: collection.collectionLikedCount,
        collectionDislikedCount: collection.collectionDislikedCount,
        collectionSharedCount: collection.collectionSharedCount,
        musics: collection.musics,
        collector: collection.user.userNickName || collection.user.userName || "未知",
        ...collection,
      }));
    } else {
      console.error("Collection API response format is incorrect:", result);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch collection data:", error);
    return [];
  }
};

// --- 修改组件的 props，增加一个 collectionKey ---
const CollectionOutput = ({ userId, userName, userNickName, searchState, collectionKey = "Collection", width="600px" }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadCollections = async () => {
      setLoading(true);
      // 在调用时，传入新的 collectionKey 参数
      const data = await fetchCollections(userId, searchState, collectionKey);
      setCollections(data);
      setLoading(false);
    };

    loadCollections();
  }, [userId, searchState, collectionKey]); // 把 collectionKey 添加到依赖项数组中，确保切换时能重新加载数据

  // 搜索过滤逻辑保持不变
  const filteredCollections = collections.filter((item) => {
    const term = searchTerm.toLowerCase();
    const title = (item.collectionName || "").toLowerCase();
    return title.includes(term);
  });

  const renderCollectionList = () => {
    if (loading) {
      return (
        <div className="center">
          <h2>加载中...</h2>
        </div>
      );
    }

    if (filteredCollections.length === 0) {
      // --- 修改空状态的提示文案，使其更友好 ---
      let emptyMessage = "列表为空";
      if (searchTerm) {
          emptyMessage = "没有匹配结果";
      } else if (collectionKey === "Marked") {
          emptyMessage = "您还没有收藏任何歌单哦";
      }

      return (
        <div className="center">
          <h2>{emptyMessage}</h2>
        </div>
      );
    }

    return <MusicCollectionList allcollection={filteredCollections} />;
  };

  // --- 修改标题的生成逻辑 ---
  const getTitle = () => {
      if (collectionKey === "Marked") {
          return "我收藏的歌单";
      }
      // 保持原有逻辑
      return `${searchState === "public" ? `${userNickName ? userNickName : userName}` : "我"}的歌单`;
  }

  return (
    <div className="music-collection-section" style={{width: width}}>
      <div className="section-header">
        <h3 className="section-title">{getTitle()}</h3>
        <div className="section-search">
          <input
            type="text"
            placeholder="筛选歌单名称"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {renderCollectionList()}
    </div>
  );
};

export default CollectionOutput;