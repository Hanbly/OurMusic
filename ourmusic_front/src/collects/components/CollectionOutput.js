import React, { useState } from "react";
import MusicCollectionList from "./CollectionList"; // 确保此组件路径正确
import "./CollectionOutput.css";

const CollectionOutput = ({
  collections,
  isLoading,
  error,
  userId,
  userName,
  userNickName,
  searchState,
  collectionKey = "Collection",
  width = "600px",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCollections =
    collections?.filter((item) => {
      const term = searchTerm.toLowerCase();
      const title = (item.collectionName || "").toLowerCase();
      return title.includes(term);
    }) || [];

  const renderCollectionList = () => {
    if (isLoading) {
      return (
        <div className="center">
          <h2>加载中...</h2>
        </div>
      );
    }

    if (error && (!collections || collections.length === 0)) {
        return (
            <div className="center">
                <h2>{error}</h2>
            </div>
        )
    }

    if (filteredCollections.length === 0) {
      let emptyMessage = "列表为空";
      if (searchTerm) {
        emptyMessage = "没有匹配结果";
      } else if (collectionKey === "Marked") {
        emptyMessage = "您还没有收藏任何歌单哦";
      } else {
        emptyMessage = "这里什么都没有哦~";
      }

      return (
        <div className="center">
          <h2>{emptyMessage}</h2>
        </div>
      );
    }

    return <MusicCollectionList allcollection={filteredCollections} />;
  };

  const getTitle = () => {
    if (collectionKey === "Marked") {
      return "我收藏的歌单";
    }
    // 保持原有逻辑
    return `${
      searchState === "public" ? userNickName || userName : "我"
    }的歌单`;
  };

  return (
    <div className="music-collection-section" style={{ width: width }}>
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