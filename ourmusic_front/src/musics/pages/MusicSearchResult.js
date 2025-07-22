import React from "react";
import { Link } from "react-router-dom";
import { FaMusic, FaListAlt, FaFire } from 'react-icons/fa';

import "./MusicSearchResult.css";

const MusicSearchResult = ({ hotSongs, searchResults, searchTerm, isLoading }) => {

  const renderHotList = () => {
    if (!hotSongs || hotSongs.length === 0) {
      return <div className="search-result-empty">暂无热歌信息</div>;
    }
    return (
      <div className="hot-search-list">
        <div className="result-section-title"><FaFire /> 本周前十音乐榜</div>
        <ul>
          {hotSongs.map((song, index) => (
            <li key={song.musicId}>
              <Link to={`/${song.musicId}/musicInfo`} className="hot-song-item">
                <span className={`hot-song-rank rank-${index + 1}`}>{index + 1}</span>
                <span className="hot-song-name">{song.musicName}</span>
                <span className="hot-song-artist">{song.musicArtist || '未知艺术家'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSearchResults = () => {
    const { songs = [], collections = [] } = searchResults || {};
    
    if (songs.length === 0 && collections.length === 0) {
      return <div className="search-result-empty">未能找到与“{searchTerm}”相关的内容</div>;
    }

    return (
      <div className="search-results">
        {songs.length > 0 && (
          <div className="search-result-section">
            <div className="result-section-title"><FaMusic /> 单曲</div>
            <ul>
              {songs.map(song => (
                <li key={song.musicId}>
                  <Link to={`/${song.musicId}/musicInfo`} className="search-result-item">
                    <FaMusic className="item-type-icon" />
                    <div className="item-text-wrapper">
                      <span className="item-primary-text">{song.musicName}</span>
                      <span className="item-secondary-text">{song.musicArtist || '未知艺术家'}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {collections.length > 0 && (
          <div className="search-result-section">
            <div className="result-section-title"><FaListAlt /> 歌单</div>
            <ul>
              {collections.map(collection => (
                <li key={collection.collectionId || collection._id}>
                  <Link to={`/${collection.collectionId}/collectionInfo`} className="search-result-item">
                     <FaListAlt className="item-type-icon" />
                     <div className="item-text-wrapper">
                       <span className="item-primary-text">{collection.collectionName}</span>
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
      ) : (
        searchTerm ? renderSearchResults() : renderHotList()
      )}
    </div>
  );
};

export default MusicSearchResult;