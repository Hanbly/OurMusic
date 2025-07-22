import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../api-config";
import { useAudio } from "../../context/audio-context";
import { AuthContext } from "../../context/auth-context";

// 引入您指定的音乐列表项组件
import MusicListItemPublicLongVer from "../../shared/components/UI/MusicListItemPublicLongVer";
import CollectionListItemPublic from "../../shared/components/UI/CollectionListItemPublic";
// 引入一个简单的加载组件，可以替换为您项目中的
import { FaCompactDisc } from "react-icons/fa";
import { IoMusicalNotes, IoAlbums } from "react-icons/io5";

import "./MusicNormalSearch.css";

const MusicNormalSearch = () => {
  // 从 URL 中获取搜索关键词，例如 /search/山下達郎
  const { searchKey } = useParams();

  const [musicResults, setMusicResults] = useState([]);
  const [collectionResults, setCollectionResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);
  const { playTrack } = useAudio();

  useEffect(() => {
    // 如果没有搜索词，则不执行任何操作
    if (!searchKey) {
      setIsLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);

      // 构建两个API请求的Promise
      const musicRequest = axiosClient.get("/api/music/batch", {
        params: {
          musicGenre: searchKey,
          musicName: searchKey,
          musicArtist: searchKey,
          musicAlbum: searchKey,
          musicYear: searchKey,
          mode: "search", // 或者其他适合的mode
        },
      });

      const collectionRequest = axiosClient.get("/api/collection/batch", {
        params: {
          collectionName: searchKey,
          collectionGenre: searchKey,
          mode: "search",
        },
      });

      try {
        // 使用 Promise.all 并行发起请求，提高效率
        const [musicResponse, collectionResponse] = await Promise.all([
          musicRequest,
          collectionRequest,
        ]);

        // 处理音乐搜索结果
        if (musicResponse.data && musicResponse.data.code === 200) {
          setMusicResults(musicResponse.data.data || []);
        } else {
          // 即使单个请求失败，也记录错误，但允许另一个成功
          console.error("获取音乐列表失败:", musicResponse.data.message);
        }

        // 处理歌单搜索结果
        if (collectionResponse.data && collectionResponse.data.code === 200) {
          setCollectionResults(collectionResponse.data.data || []);
        } else {
          console.error("获取歌单列表失败:", collectionResponse.data.message);
        }
      } catch (err) {
        console.error("搜索时发生网络错误:", err);
        setError("加载搜索结果失败，请检查网络连接或稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchKey]); // 依赖项是 searchKey，当它变化时重新搜索

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="search-status-feedback">
          <FaCompactDisc className="spinner-icon" />
          <span>正在努力搜索...</span>
        </div>
      );
    }

    if (error) {
      return <div className="search-status-feedback error">{error}</div>;
    }

    if (musicResults.length === 0 && collectionResults.length === 0) {
      return (
        <div className="search-status-feedback">
          未能找到与 “{searchKey}” 相关的内容
        </div>
      );
    }

    let music = null;
    const handlePlayAll = (musics) => {
    if (musics && musics.length > 0) {
      music = musics[0];
      playTrack(music, musics);
    }
  };

    return (
      <div className="search-results-container">
        {/* 单曲结果板块 */}
        {musicResults.length > 0 && (
          <section className="search-results-section">
            <h3 className="section-title">
              <IoMusicalNotes />
              单曲
            </h3>
            <div className="music-list-container">
              {musicResults.map((music) => (
                <MusicListItemPublicLongVer
                  music={music}
                  key={music.musicId}
                  width="95%"
                />
              ))}
            </div>
          </section>
        )}

        {/* 歌单结果板块 */}
        {collectionResults.length > 0 && (
          <section className="search-results-section">
            <h3 className="section-title">
              <IoAlbums />
              歌单
            </h3>
            <ul className="collection-list-container">
              {collectionResults.map((collection) => (
                <CollectionListItemPublic
                  key={collection.id}
                  collection={collection}
                  onPlayAll={handlePlayAll}
                  width="600px"
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="music-normal-search-page">
      <header className="search-header">
        <h1>发现关于 "{searchKey}" ：</h1>
      </header>
      {renderContent()}
    </div>
  );
};

export default MusicNormalSearch;
