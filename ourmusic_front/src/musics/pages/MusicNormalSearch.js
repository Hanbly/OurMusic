import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api-config";

// 组件引入
import MusicListItemPublicLongVer from "../../shared/components/UI/MusicListItemPublicLongVer";
import CollectionListItemPublic from "../../shared/components/UI/CollectionListItemPublic";
import Pagination from "../../shared/components/UI/Pagination";
import { FaCompactDisc } from "react-icons/fa";
import { IoMusicalNotes, IoAlbums } from "react-icons/io5";

import "./MusicNormalSearch.css";

// 注意：FilterDropdown 组件在这个版本中不再使用，可以安全地移除其定义和引入

const MusicNormalSearch = () => {
  const { searchKey } = useParams();

  // --- State 管理：为音乐和歌单分别管理服务端分页状态 ---
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
    if (!searchKey) {
      setMusicData((prev) => ({ ...prev, isLoading: false }));
      setCollectionData((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchSearchResults = async () => {
      setMusicData((prev) => ({ ...prev, isLoading: true, error: null }));
      setCollectionData((prev) => ({ ...prev, isLoading: true, error: null }));

      const musicRequest = axiosClient.get("/api/music/batch", {
        params: {
          // 后端是 OR 搜索，所以每个字段都带上 searchKey
          musicGenre: searchKey,
          musicName: searchKey,
          musicArtist: searchKey,
          musicAlbum: searchKey,
          musicYear: searchKey,
          mode: "search",
          page: musicData.pageInfo.number,
          size: musicData.pageInfo.size,
        },
      });

      const collectionRequest = axiosClient.get("/api/collection/batch", {
        params: {
          collectionName: searchKey,
          collectionGenre: searchKey,
          mode: "search",
          page: collectionData.pageInfo.number,
          size: collectionData.pageInfo.size,
        },
      });

      try {
        const [musicResponse, collectionResponse] = await Promise.allSettled([
          musicRequest,
          collectionRequest,
        ]);

        // --- 修改点：更健壮地处理音乐请求的结果 ---
        if (musicResponse.status === "fulfilled") {
          const result = musicResponse.value.data;
          // 检查 result.data 是否存在且是一个对象
          if (
            result &&
            result.code === 200 &&
            result.data &&
            typeof result.data === "object"
          ) {
            const pageData = result.data;
            setMusicData({
              content: pageData.content || [], // 如果 content 为 null，则给一个空数组
              pageInfo: {
                number: pageData.number || 0,
                totalPages: pageData.totalPages || 1,
                size: pageData.size || 20,
              },
              isLoading: false,
              error: null,
            });
          } else {
            // 即使 code=200，但 data=null，也视为无结果
            setMusicData((prev) => ({
              ...prev,
              content: [],
              isLoading: false,
              error: null,
              pageInfo: { ...prev.pageInfo, number: 0, totalPages: 1 },
            }));
          }
        } else {
          // status === 'rejected'
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

        // --- 修改点：同样健壮地处理歌单请求的结果 ---
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
          // status === 'rejected'
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
        // 这个 catch 块现在基本不会被触发，但保留作为最后防线
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
  }, [searchKey, musicData.pageInfo.number, collectionData.pageInfo.number]);

  // --- 分页事件处理 ---
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

  // --- 渲染逻辑 ---
  const renderContent = () => {
    if (musicData.isLoading && collectionData.isLoading) {
      return (
        <div className="search-status-feedback">
          <FaCompactDisc className="spinner-icon" />
          <span>正在努力搜索...</span>
        </div>
      );
    }

    // 如果两个列表都加载完成且都为空
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
        {/* 音乐部分 */}
        <section className="search-results-section">
          <div className="section-header">
            <h3 className="section-title">
              <IoMusicalNotes /> 单曲
            </h3>
            {/* 筛选器已被移除 */}
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

        {/* 歌单部分 */}
        <section className="search-results-section">
          <div className="section-header">
            <h3 className="section-title">
              <IoAlbums /> 歌单
            </h3>
            {/* 筛选器已被移除 */}
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
