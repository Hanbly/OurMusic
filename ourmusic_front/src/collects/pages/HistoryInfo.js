import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlay, FaPause } from "react-icons/fa";

import axiosClient from '../../api-config';
import { useAudio } from '../../context/audio-context';
import Pagination from '../../shared/components/UI/Pagination';
import MusicListItemHistoryLongVer from '../../shared/components/UI/MusicListItemHistoryLongVer';

import "./HistoryInfo.css";

const HistoryInfo = () => {
  const { userId } = useParams();
  const [collectionData, setCollectionData] = useState(null);
  const [musics, setMusics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    playTrack,
    currentTrack,
    isPlaying,
    togglePlayPause,
    playlist
  } = useAudio();

  const isCurrentCollectionPlaying =
    playlist.length > 0 &&
    musics.length > 0 &&
    playlist[0].musicId === musics[0].musicId;

  useEffect(() => {
    const fetchHistoryDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(`/api/collection/history/${userId}`, {
          params: {
            page: currentPage - 1,
            size: 10
          }
        });
        const result = response.data;
        if (result && result.code === 200) {
          setCollectionData(result.data);
          setMusics(result.data.musics || []);
          setTotalPages(result.data.totalPages || 1);
        } else {
          throw new Error(result.message || '未能获取历史记录详情');
        }
      } catch (err) {
        setError(err.message);
        setCollectionData(null);
        setMusics([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchHistoryDetails();
    }
  }, [userId, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  const handlePlayAll = () => {
    if (isCurrentCollectionPlaying) {
      togglePlayPause();
    } else {
      if (musics.length > 0) {
        playTrack(musics[0], musics);
      }
    }
  };

  const handlePlaySingle = (music) => {
    playTrack(music, musics);
  };

  if (isLoading && !collectionData) {
    return <div className="page-status">正在加载历史记录...</div>;
  }

  if (error) {
    return <div className="page-status error">错误: {error}</div>;
  }

  if (!collectionData) {
    return <div className="page-status">未找到历史记录数据。</div>;
  }

  return (
    <div className="collection-info-page">
      <header className="collection-info-header">
        <div className="header__image-container" onClick={handlePlayAll}>
          <img src={collectionData.collectionImageFileUrl} alt={collectionData.collectionName} />
          <div className="play-overlay">
            {isCurrentCollectionPlaying && isPlaying ? <FaPause /> : <FaPlay />}
          </div>
        </div>
        <div className="header__details">
          <h1 className="header__title">{collectionData.collectionName}</h1>
          <p className="header__description">{collectionData.collectionDescription || '暂无描述'}</p>
          <div className="header__meta">
            <div className="header__user">
              <img src={collectionData.user.userAvatarFileUrl} alt={collectionData.user.userNickName ? collectionData.user.userNickName : collectionData.user.userName} className="user__avatar" />
              {/* <span>{collectionData.user.userNickName ? collectionData.user.userNickName : collectionData.user.userName}</span> */}
            </div>
            <span className="meta__song-count">{collectionData.collectionMusicsNumber} 首音乐</span>
          </div>
          <div className="header__actions">
            <button className="action-button play-all" onClick={handlePlayAll}>
              {isCurrentCollectionPlaying && isPlaying ? <FaPause /> : <FaPlay />}
              {isCurrentCollectionPlaying && isPlaying ? '暂停' : '播放全部'}
            </button>
          </div>
        </div>
      </header>
      
      <main className="music-list-container">
        {isLoading ? (
          <div className="page-status">正在加载音乐...</div>
        ) : (
          <ul>
            {musics.length > 0 ? (
              musics.map(music => (
                <MusicListItemHistoryLongVer
                  key={music.musicId}
                  music={music}
                  width="100%"
                  onPlay={() => handlePlaySingle(music)}
                  isPlaying={currentTrack?.musicId === music.musicId && isPlaying}
                />
              ))
            ) : (
              <li className="no-music-message">当前页面没有历史记录。</li>
            )}
          </ul>
        )}
      </main>

      {!isLoading && musics.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default HistoryInfo;