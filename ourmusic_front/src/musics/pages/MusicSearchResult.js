// MusicSearchResult.js

import React from "react";
import { Link, useHistory } from "react-router-dom";
import {
  FaMusic,
  FaListAlt,
  FaFire,
  FaSearch,
  FaHistory,
  FaTrash,
} from "react-icons/fa";

import "./MusicSearchResult.css";

const MusicSearchResult = ({
  hotSongs,
  searchResults,
  relatedSearches,
  searchHistory,
  searchTerm,
  isLoading,
  setIsSearchFocused,
  axiosClient,
  auth,
}) => {
  const history = useHistory();

  const handleRelatedSearchClick = (term) => {
    if (!term) return;

    history.push(`/s/${term}`);
    setIsSearchFocused(false);

    if (axiosClient && auth?.userId) {
      axiosClient.post("/api/search", {
        searchContent: term,
        searchType: "POSITIVE",
        userId: auth.userId,
      });
    }
  };

  const handleDeleteSearchHistroy = () => {
    axiosClient.put(`/api/search/${auth.userId}/d-history`).then((response) => {
      alert(response.data.message);
    });
  };

  // 新增: 渲染搜索历史的函数
  const renderSearchHistory = () => {
    if (!searchHistory || searchHistory.length === 0) {
      return null;
    }
    return (
      <div className="search-result-section history-search-section">
        <div className="result-section-title">
          <FaHistory /> 搜索历史
        </div>
        <div className="history-content-wrapper">
          <div className="related-search-list">
            {searchHistory.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className="related-search-item"
                onClick={() =>
                  handleRelatedSearchClick(item.searchContent || item)
                }
              >
                {item.searchContent || item}
              </div>
            ))}
          </div>
          <div className="clear-history-button-container">
            <button
              onClick={handleDeleteSearchHistroy}
              className="icon-button delete-button"
              title="删除搜索历史"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHotList = () => {
    if (!hotSongs || hotSongs.length === 0) {
      return null; // 如果没有热歌，不显示 "暂无信息"，让布局更干净
    }
    return (
      <div className="hot-search-list">
        <div className="result-section-title">
          <FaFire /> 本周前十音乐榜
        </div>
        <ul>
          {hotSongs.map((song, index) => (
            <li key={song.musicId}>
              <Link to={`/${song.musicId}/musicInfo`} className="hot-song-item">
                <span className={`hot-song-rank rank-${index + 1}`}>
                  {index + 1}
                </span>
                <span className="hot-song-name">{song.musicName}</span>
                <span className="hot-song-artist">
                  {song.musicArtist || "未知艺术家"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderDefaultView = () => {
    const hasHistory = searchHistory && searchHistory.length > 0;
    const hasHotSongs = hotSongs && hotSongs.length > 0;

    if (!hasHistory && !hasHotSongs) {
      return <div className="search-result-empty">暂无热门内容</div>;
    }

    return (
      <>
        {renderSearchHistory()}
        {renderHotList()}
      </>
    );
  };

  const renderRelatedSearches = () => {
    if (!relatedSearches || relatedSearches.length === 0) {
      return null;
    }
    return (
      <div className="search-result-section related-search-section">
        <div className="result-section-title">
          <FaSearch /> 相关搜索
        </div>
        <div className="related-content-wrapper">
          <div className="related-search-list">
            {relatedSearches.slice(0, 10).map((term, index) => (
              <div
                key={index}
                className="related-search-item"
                onClick={() => handleRelatedSearchClick(term)}
              >
                {term}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSearchResults = () => {
    const { songs = [], collections = [] } = searchResults || {};
    const hasNoDirectResults = songs.length === 0 && collections.length === 0;
    const hasNoRelatedResults =
      !relatedSearches || relatedSearches.length === 0;

    if (hasNoDirectResults && hasNoRelatedResults) {
      return (
        <div className="search-result-empty">
          未能找到与“{searchTerm}”相关的内容
        </div>
      );
    }

    return (
      <div className="search-results">
        {renderRelatedSearches()}
        {songs.length > 0 && (
          <div className="search-result-section">
            <div className="result-section-title">
              <FaMusic /> 单曲
            </div>
            <ul>
              {songs.map((song) => (
                <li key={song.musicId}>
                  <Link
                    to={`/${song.musicId}/musicInfo`}
                    className="search-result-item"
                  >
                    <FaMusic className="item-type-icon" />
                    <div className="item-text-wrapper">
                      <span className="item-primary-text">
                        {song.musicName}
                      </span>
                      <span className="item-secondary-text">
                        {song.musicArtist || "未知艺术家"}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {collections.length > 0 && (
          <div className="search-result-section">
            <div className="result-section-title">
              <FaListAlt /> 歌单
            </div>
            <ul>
              {collections.map((collection) => (
                <li key={collection.collectionId || collection._id}>
                  <Link
                    to={`/${collection.collectionId}/collectionInfo`}
                    className="search-result-item"
                  >
                    <FaListAlt className="item-type-icon" />
                    <div className="item-text-wrapper">
                      <span className="item-primary-text">
                        {collection.collectionName}
                      </span>
                      <span className="item-secondary-text">歌单</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="music-search-result-container">
      {isLoading ? (
        <div className="search-result-loading">加载中...</div>
      ) : searchTerm ? (
        renderSearchResults()
      ) : (
        renderDefaultView()
      )}
    </div>
  );
};

export default MusicSearchResult;
