import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../api-config";
import { useAudio } from "../../context/audio-context";
import { AuthContext } from "../../context/auth-context";

// 复用相同的子组件
import MusicListItemPublicLongVer from "../../shared/components/UI/MusicListItemPublicLongVer";
import CollectionListItemPublic from "../../shared/components/UI/CollectionListItemPublic";
// 复用相同的图标
import { FaCompactDisc } from "react-icons/fa";
import { IoMusicalNotes, IoAlbums } from "react-icons/io5";

// 引入新的 CSS 文件
import "./MusicGenreSearch.css";

const MusicGenreSearch = () => {
  // 从 URL 中获取风格名称，例如 /genre/J-POP
  // 使用更具描述性的变量名 genreName
  const { genreName } = useParams();

  const [musicResults, setMusicResults] = useState([]);
  const [collectionResults, setCollectionResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);
  const { playTrack } = useAudio();

  useEffect(() => {
    // 如果没有风格名称，则不执行任何操作
    if (!genreName) {
      setIsLoading(false);
      return;
    }

    const fetchGenreResults = async () => {
      setIsLoading(true);
      setError(null);

      // **核心修改点：只使用 genreName 作为参数**
      const musicRequest = axiosClient.get("/api/music/batch", {
        params: {
          musicGenre: genreName,
          mode: "search",
        },
      });

      const collectionRequest = axiosClient.get("/api/collection/batch", {
        params: {
          collectionGenre: genreName,
          mode: "search",
        },
      });

      try {
        const [musicResponse, collectionResponse] = await Promise.all([
          musicRequest,
          collectionRequest,
        ]);

        if (musicResponse.data && musicResponse.data.code === 200) {
          setMusicResults(musicResponse.data.data || []);
        } else {
          console.error("获取音乐列表失败:", musicResponse.data.message);
        }

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

    fetchGenreResults();
  }, [genreName]); // 依赖项是 genreName

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="search-status-feedback">
          <FaCompactDisc className="spinner-icon" />
          <span>正在加载内容...</span>
        </div>
      );
    }

    if (error) {
      return <div className="search-status-feedback error">{error}</div>;
    }

    if (musicResults.length === 0 && collectionResults.length === 0) {
      return (
        <div className="search-status-feedback">
          未能找到与风格 “{genreName}” 相关的内容
        </div>
      );
    }
    
    // handlePlayAll 函数逻辑保持不变
    const handlePlayAll = (musics) => {
      if (musics && musics.length > 0) {
        const music = musics[0];
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
              相关单曲
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
              相关歌单
            </h3>
            <ul className="collection-list-container">
              {collectionResults.map((collection) => (
                <CollectionListItemPublic
                  key={collection.collectionId} // 确保 key 是唯一的
                  collection={collection}
                  onPlayAll={() => handlePlayAll(collection.musics)} // 修正：正确传递 musics 数组
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
    <div className="music-genre-search-page">
      <header className="search-header">
        {/* **核心修改点：突出显示风格内容** */}
        <h1>流派: {genreName}</h1>
        <p className="search-subtitle">探索属于 “{genreName}” 风格的音乐和歌单。</p>
      </header>
      {renderContent()}
    </div>
  );
};

export default MusicGenreSearch;
