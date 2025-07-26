import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api-config";
import { useAudio } from "../../context/audio-context";

// 复用相同的子组件和分页组件
import MusicListItemPublicLongVer from "../../shared/components/UI/MusicListItemPublicLongVer";
import CollectionListItemPublic from "../../shared/components/UI/CollectionListItemPublic";
import Pagination from "../../shared/components/UI/Pagination";
// 复用相同的图标
import { FaCompactDisc } from "react-icons/fa";
import { IoMusicalNotes, IoAlbums } from "react-icons/io5";

import "./MusicGenreSearch.css";

const MusicGenreSearch = () => {
  const { genreName } = useParams();
  const { playTrack } = useAudio();

  // --- State 管理：为音乐和歌单分别管理分页状态 ---
  const [musicData, setMusicData] = useState({
    content: [],
    pageInfo: { number: 0, totalPages: 1, size: 10 },
    isLoading: true,
    error: null,
  });

  const [collectionData, setCollectionData] = useState({
    content: [],
    pageInfo: { number: 0, totalPages: 1, size: 6 },
    isLoading: true,
    error: null,
  });

  // --- 数据获取 Effect ---
  useEffect(() => {
    if (!genreName) {
      setMusicData(prev => ({ ...prev, isLoading: false }));
      setCollectionData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchGenreResults = async () => {
      // 同时设置两个板块为加载状态
      setMusicData(prev => ({ ...prev, isLoading: true, error: null }));
      setCollectionData(prev => ({ ...prev, isLoading: true, error: null }));

      // 准备两个并行的、带分页参数的请求
      const musicRequest = axiosClient.get("/api/music/batch", {
        params: {
          musicGenre: genreName,
          mode: "search", // 保持 mode 参数
          page: musicData.pageInfo.number,
          size: musicData.pageInfo.size,
        },
      });

      const collectionRequest = axiosClient.get("/api/collection/batch", { // 假设歌单也有类似的分页接口
        params: {
          collectionGenre: genreName,
          mode: "search",
          page: collectionData.pageInfo.number,
          size: collectionData.pageInfo.size,
        },
      });

      try {
        // 并行发送请求
        const [musicResponse, collectionResponse] = await Promise.allSettled([
          musicRequest,
          collectionRequest,
        ]);

        // 单独处理音乐请求的结果
        if (musicResponse.status === 'fulfilled' && musicResponse.value.data.code === 200) {
          const data = musicResponse.value.data.data;
          setMusicData({
            content: data.content || [],
            pageInfo: { number: data.number, totalPages: data.totalPages, size: data.size },
            isLoading: false,
            error: null,
          });
        } else {
          const errorMsg = musicResponse.reason?.response?.data?.message || "获取音乐列表失败";
          setMusicData(prev => ({ ...prev, content: [], isLoading: false, error: errorMsg }));
        }

        // 单独处理歌单请求的结果
        if (collectionResponse.status === 'fulfilled' && collectionResponse.value.data.code === 200) {
          const data = collectionResponse.value.data.data;
          setCollectionData({
            content: data.content || [],
            pageInfo: { number: data.number, totalPages: data.totalPages, size: data.size },
            isLoading: false,
            error: null,
          });
        } else {
            const errorMsg = collectionResponse.reason?.response?.data?.message || "获取歌单列表失败";
            setCollectionData(prev => ({ ...prev, content: [], isLoading: false, error: errorMsg }));
        }

      } catch (err) {
        // 这个 catch 主要捕获 Promise.allSettled 本身的错误，虽然很少见
        console.error("请求封装时发生错误:", err);
      }
    };

    fetchGenreResults();
  }, [genreName, musicData.pageInfo.number, collectionData.pageInfo.number]); // 依赖项

  
  // --- 事件处理函数 ---
  const handleMusicPageChange = (newPage) => {
    setMusicData(prev => ({
      ...prev,
      pageInfo: { ...prev.pageInfo, number: newPage - 1 },
    }));
  };

  const handleCollectionPageChange = (newPage) => {
    setCollectionData(prev => ({
      ...prev,
      pageInfo: { ...prev.pageInfo, number: newPage - 1 },
    }));
  };

  const handlePlayAll = (musics) => {
    if (musics && musics.length > 0) {
      playTrack(musics[0], musics);
    }
  };

  // --- 渲染逻辑 (保持原有结构) ---
  const renderContent = () => {
    // 整体的加载和错误判断
    if (musicData.isLoading && collectionData.isLoading) {
      return (
        <div className="search-status-feedback">
          <FaCompactDisc className="spinner-icon" />
          <span>正在加载内容...</span>
        </div>
      );
    }

    if (musicData.content.length === 0 && collectionData.content.length === 0 && (musicData.error || collectionData.error)) {
        return <div className="search-status-feedback error">加载 “{genreName}” 相关内容失败</div>;
    }
    
    if (musicData.content.length === 0 && collectionData.content.length === 0 && !musicData.isLoading && !collectionData.isLoading) {
      return (
        <div className="search-status-feedback">
          未能找到与风格 “{genreName}” 相关的内容
        </div>
      );
    }

    return (
      <div className="search-results-container">
        {/* 单曲结果板块 */}
        {musicData.isLoading ? (
            <div className="search-status-feedback">加载相关单曲...</div>
        ) : musicData.error ? (
            <div className="search-status-feedback error">{musicData.error}</div>
        ) : musicData.content.length > 0 && (
          <section className="search-results-section">
            <h3 className="section-title">
              <IoMusicalNotes />
              相关单曲
            </h3>
            <div className="music-list-container">
              {musicData.content.map((music) => (
                <MusicListItemPublicLongVer
                  music={music}
                  key={music.musicId}
                  width="95%"
                />
              ))}
            </div>
            <Pagination
              currentPage={musicData.pageInfo.number + 1}
              totalPages={musicData.pageInfo.totalPages}
              onPageChange={handleMusicPageChange}
            />
          </section>
        )}

        {/* 歌单结果板块 */}
        {collectionData.isLoading ? (
             <div className="search-status-feedback">加载相关歌单...</div>
        ) : collectionData.error ? (
            <div className="search-status-feedback error">{collectionData.error}</div>
        ) : collectionData.content.length > 0 && (
          <section className="search-results-section">
            <h3 className="section-title">
              <IoAlbums />
              相关歌单
            </h3>
            <ul className="collection-list-container">
              {collectionData.content.map((collection) => (
                <CollectionListItemPublic
                  key={collection.collectionId}
                  collection={collection}
                  onPlayAll={() => handlePlayAll(collection.musics)}
                  width="600px"
                />
              ))}
            </ul>
            <Pagination
              currentPage={collectionData.pageInfo.number + 1}
              totalPages={collectionData.pageInfo.totalPages}
              onPageChange={handleCollectionPageChange}
            />
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="music-genre-search-page">
      <header className="search-header">
        <h1>流派: {genreName}</h1>
        <p className="search-subtitle">探索属于 “{genreName}” 风格的音乐和歌单。</p>
      </header>
      {renderContent()}
    </div>
  );
};

export default MusicGenreSearch;