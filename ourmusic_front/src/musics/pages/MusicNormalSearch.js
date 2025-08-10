import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api-config";
import { AuthContext } from "../../context/auth-context"; // 引入 AuthContext

// 组件引入
import MusicListItemPublicLongVer from "../../shared/components/UI/MusicListItemPublicLongVer";
import CollectionListItemPublic from "../../shared/components/UI/CollectionListItemPublic";
import Pagination from "../../shared/components/UI/Pagination";
import { FaCompactDisc } from "react-icons/fa";
import { IoMusicalNotes, IoAlbums } from "react-icons/io5";

import "./MusicNormalSearch.css";

const MusicNormalSearch = () => {
  const { searchKey } = useParams();
  const auth = useContext(AuthContext); // 获取 auth context

  const [musicData, setMusicData] = useState({
    content: [],
    pageInfo: { number: 0, totalPages: 1, size: 20 },
    isLoading: true,
    error: null,
  });

  const [collectionData, setCollectionData] = useState({
    content: [],
    pageInfo: { number: 0, totalPages: 1, size: 12 },
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (auth.isAuthLoading) {
      return;
    }

    if (!searchKey) {
      setMusicData((prev) => ({ ...prev, isLoading: false }));
      setCollectionData((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchSearchResults = async () => {
      setMusicData((prev) => ({ ...prev, isLoading: true, error: null }));
      setCollectionData((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const musicParams = {
        musicGenre: searchKey,
        musicName: searchKey,
        musicArtist: searchKey,
        musicAlbum: searchKey,
        musicYear: searchKey,
        mode: "search",
        page: musicData.pageInfo.number,
        size: musicData.pageInfo.size,
      };

      const collectionParams = {
        collectionName: searchKey,
        collectionGenre: searchKey,
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

        if (musicResponse.status === "fulfilled") {
          const result = musicResponse.value.data;
          if (
            result &&
            result.code === 200 &&
            result.data &&
            typeof result.data === "object"
          ) {
            const pageData = result.data;
            setMusicData({
              content: pageData.content || [],
              pageInfo: {
                number: pageData.number || 0,
                totalPages: pageData.totalPages || 1,
                size: pageData.size || 20,
              },
              isLoading: false,
              error: null,
            });
          } else {
            setMusicData((prev) => ({
              ...prev,
              content: [],
              isLoading: false,
              error: null,
              pageInfo: { ...prev.pageInfo, number: 0, totalPages: 1 },
            }));
          }
        } else {
          const errorMsg =
            musicResponse.reason?.response?.data?.message ||
            musicResponse.reason?.message ||
            "获取音乐列表失败";
          setMusicData((prev) => ({
            ...prev,
            content: [],
            isLoading: false,
            error: errorMsg,
          }));
        }

        if (collectionResponse.status === "fulfilled") {
          const result = collectionResponse.value.data;
          if (
            result &&
            result.code === 200 &&
            result.data &&
            typeof result.data === "object"
          ) {
            const pageData = result.data;
            setCollectionData({
              content: pageData.content || [],
              pageInfo: {
                number: pageData.number || 0,
                totalPages: pageData.totalPages || 1,
                size: pageData.size || 12,
              },
              isLoading: false,
              error: null,
            });
          } else {
            setCollectionData((prev) => ({
              ...prev,
              content: [],
              isLoading: false,
              error: null,
              pageInfo: { ...prev.pageInfo, number: 0, totalPages: 1 },
            }));
          }
        } else {
          const errorMsg =
            collectionResponse.reason?.response?.data?.message ||
            collectionResponse.reason?.message ||
            "获取歌单列表失败";
          setCollectionData((prev) => ({
            ...prev,
            content: [],
            isLoading: false,
            error: errorMsg,
          }));
        }
      } catch (err) {
        console.error("请求封装时发生严重错误:", err);
        const genericError = "发生意外错误，请刷新页面";
        setMusicData((prev) => ({
          ...prev,
          isLoading: false,
          error: genericError,
        }));
        setCollectionData((prev) => ({
          ...prev,
          isLoading: false,
          error: genericError,
        }));
      }
    };

    fetchSearchResults();
  }, [
    searchKey,
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

  // 渲染逻辑部分无需修改
  const renderContent = () => {
    if (
      (musicData.isLoading || collectionData.isLoading) &&
      auth.isAuthLoading
    ) {
      return (
        <div className="search-status-feedback">
          <FaCompactDisc className="spinner-icon" />
          <span>正在努力搜索...</span>
        </div>
      );
    }

    if (
      !musicData.isLoading &&
      !collectionData.isLoading &&
      musicData.content.length === 0 &&
      collectionData.content.length === 0
    ) {
      return (
        <div className="search-status-feedback">{`未能搜索到与 “${searchKey}” 相关的内容`}</div>
      );
    }

    return (
      <div className="search-results-container">
        <section className="search-results-section">
          <div className="section-header">
            <h3 className="section-title">
              <IoMusicalNotes /> 单曲
            </h3>
          </div>
          {musicData.isLoading ? (
            <div className="search-status-feedback">加载中...</div>
          ) : musicData.error ? (
            <div className="search-status-feedback error">
              {musicData.error}
            </div>
          ) : musicData.content.length > 0 ? (
            <>
              <div className="music-list-container">
                {musicData.content.map((music) => (
                  <MusicListItemPublicLongVer
                    music={music}
                    key={music.musicId}
                    width="100%"
                  />
                ))}
              </div>
              <Pagination
                currentPage={musicData.pageInfo.number + 1}
                totalPages={musicData.pageInfo.totalPages}
                onPageChange={handleMusicPageChange}
              />
            </>
          ) : (
            <div className="search-status-feedback">无相关单曲</div>
          )}
        </section>

        <section className="search-results-section">
          <div className="section-header">
            <h3 className="section-title">
              <IoAlbums /> 歌单
            </h3>
          </div>
          {collectionData.isLoading ? (
            <div className="search-status-feedback">加载中...</div>
          ) : collectionData.error ? (
            <div className="search-status-feedback error">
              {collectionData.error}
            </div>
          ) : collectionData.content.length > 0 ? (
            <>
              <ul className="collection-list-container">
                {collectionData.content.map((collection) => (
                  <CollectionListItemPublic
                    key={collection.collectionId}
                    collection={collection}
                    width="700px"
                  />
                ))}
              </ul>
              <Pagination
                currentPage={collectionData.pageInfo.number + 1}
                totalPages={collectionData.pageInfo.totalPages}
                onPageChange={handleCollectionPageChange}
              />
            </>
          ) : (
            <div className="search-status-feedback">无相关歌单</div>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className="music-normal-search-page">
      <header className="search-header">
        <h1>搜索结果: “{searchKey}”</h1>
      </header>
      {renderContent()}
    </div>
  );
};

export default MusicNormalSearch;