import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api-config";
import { useAudio } from "../../context/audio-context";
import { AuthContext } from "../../context/auth-context"; // 引入 AuthContext

import MusicListItemPublicLongVer from "../../shared/components/UI/MusicListItemPublicLongVer";
import CollectionListItemPublic from "../../shared/components/UI/CollectionListItemPublic";
import Pagination from "../../shared/components/UI/Pagination";
import { FaCompactDisc } from "react-icons/fa";
import { IoMusicalNotes, IoAlbums } from "react-icons/io5";

import "./MusicGenreSearch.css";

const MusicGenreSearch = () => {
  const { genreName } = useParams();
  const { playTrack } = useAudio();
  const auth = useContext(AuthContext); // 获取 auth context

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

  useEffect(() => {
    if (auth.isAuthLoading) {
      return;
    }

    if (!genreName) {
      setMusicData((prev) => ({ ...prev, isLoading: false }));
      setCollectionData((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchGenreResults = async () => {
      setMusicData((prev) => ({ ...prev, isLoading: true, error: null }));
      setCollectionData((prev) => ({ ...prev, isLoading: true, error: null }));

      const musicParams = {
        musicGenre: genreName,
        mode: "search",
        page: musicData.pageInfo.number,
        size: musicData.pageInfo.size,
      };

      const collectionParams = {
        collectionGenre: genreName,
        mode: "search",
        page: collectionData.pageInfo.number,
        size: collectionData.pageInfo.size,
      };
      
      // --- 关键修改: 为两个请求都添加 operateUserId ---
      if (auth.userId) {
        musicParams.operateUserId = auth.userId;
        collectionParams.operateUserId = auth.userId;
      }
      
      const musicRequest = axiosClient.get("/api/music/batch", { params: musicParams });
      const collectionRequest = axiosClient.get("/api/collection/batch", { params: collectionParams });

      try {
        const [musicResponse, collectionResponse] = await Promise.allSettled([
          musicRequest,
          collectionRequest,
        ]);

        if (
          musicResponse.status === "fulfilled" &&
          musicResponse.value.data.code === 200
        ) {
          const data = musicResponse.value.data.data;
          setMusicData({
            content: data?.content || [],
            pageInfo: {
              number: data?.number || 0,
              totalPages: data?.totalPages || 1,
              size: data?.size || 10,
            },
            isLoading: false,
            error: null,
          });
        } else {
          const errorMsg =
            musicResponse.reason?.response?.data?.message || "获取音乐列表失败";
          setMusicData((prev) => ({
            ...prev,
            content: [],
            isLoading: false,
            error: errorMsg,
          }));
        }

        if (
          collectionResponse.status === "fulfilled" &&
          collectionResponse.value.data.code === 200
        ) {
          const data = collectionResponse.value.data.data;
          setCollectionData({
            content: data?.content || [],
            pageInfo: {
              number: data?.number || 0,
              totalPages: data?.totalPages || 1,
              size: data?.size || 6,
            },
            isLoading: false,
            error: null,
          });
        } else {
          const errorMsg =
            collectionResponse.reason?.response?.data?.message ||
            "获取歌单列表失败";
          setCollectionData((prev) => ({
            ...prev,
            content: [],
            isLoading: false,
            error: errorMsg,
          }));
        }
      } catch (err) {
        console.error("请求封装时发生错误:", err);
      }
    };

    fetchGenreResults();
  }, [
    genreName,
    musicData.pageInfo.number,
    collectionData.pageInfo.number,
    auth.isAuthLoading,
    auth.userId,
  ]);

  
  const handleMusicPageChange = (newPage) => {
    setMusicData((prev) => ({
      ...prev,
      pageInfo: { ...prev.pageInfo, number: newPage - 1 },
    }));
  };

  const handleCollectionPageChange = (newPage) => {
    setCollectionData((prev) => ({
      ...prev,
      pageInfo: { ...prev.pageInfo, number: newPage - 1 },
    }));
  };

  const handlePlayAll = (musics) => {
    if (musics && musics.length > 0) {
      playTrack(musics[0], musics);
    }
  };

  // 渲染逻辑部分无需修改
  const renderContent = () => {
    if (
      (musicData.isLoading || collectionData.isLoading) &&
      auth.isAuthLoading
    ) {
      return (
        <div className="search-status-feedback">
          <FaCompactDisc className="spinner-icon" />
          <span>正在加载内容...</span>
        </div>
      );
    }

    if (
      musicData.content.length === 0 &&
      collectionData.content.length === 0 &&
      (musicData.error || collectionData.error)
    ) {
      return (
        <div className="search-status-feedback error">
          加载 “{genreName}” 相关内容失败
        </div>
      );
    }

    if (
      musicData.content.length === 0 &&
      collectionData.content.length === 0 &&
      !musicData.isLoading &&
      !collectionData.isLoading
    ) {
      return (
        <div className="search-status-feedback">
          未能找到与风格 “{genreName}” 相关的内容
        </div>
      );
    }

    return (
      <div className="search-results-container">
        {musicData.isLoading ? (
          <div className="search-status-feedback">加载相关单曲...</div>
        ) : musicData.error ? (
          <div className="search-status-feedback error">{musicData.error}</div>
        ) : (
          musicData.content.length > 0 && (
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
          )
        )}

        {collectionData.isLoading ? (
          <div className="search-status-feedback">加载相关歌单...</div>
        ) : collectionData.error ? (
          <div className="search-status-feedback error">
            {collectionData.error}
          </div>
        ) : (
          collectionData.content.length > 0 && (
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
                    width="700px"
                  />
                ))}
              </ul>
              <Pagination
                currentPage={collectionData.pageInfo.number + 1}
                totalPages={collectionData.pageInfo.totalPages}
                onPageChange={handleCollectionPageChange}
              />
            </section>
          )
        )}
      </div>
    );
  };

  return (
    <div className="music-genre-search-page">
      <header className="search-header">
        <h1>流派: {genreName}</h1>
        <p className="search-subtitle">
          探索属于 “{genreName}” 风格的音乐和歌单。
        </p>
      </header>
      {renderContent()}
    </div>
  );
};

export default MusicGenreSearch;