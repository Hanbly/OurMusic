import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlay, FaPause } from "react-icons/fa";

import axiosClient from '../../api-config';
import { useAudio } from '../../context/audio-context';

import MusicListItemHistoryLongVer from '../../shared/components/UI/MusicListItemHistoryLongVer';
import "./HistoryInfo.css";

const HistoryInfo = () => {
  const { userId } = useParams(); // 从URL中获取userId
  const [collectionData, setCollectionData] = useState(null);
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
    collectionData &&
    playlist.length > 0 &&
    collectionData.musics.length > 0 &&
    playlist[0].musicId === collectionData.musics[0].musicId;

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(`/api/collection/history/${userId}`)
        const result = response.data;
        if (result && result.code === 200) {
          setCollectionData(result.data);
        }
        else {
          throw new Error(result.message || '未能获取历史记录详情');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [userId]); // 当userId变化时，重新获取数据

  const handlePlayAll = () => {
    if (isCurrentCollectionPlaying) {
      togglePlayPause();
    } else {
      if (collectionData && collectionData.musics.length > 0) {
        playTrack(collectionData.musics[0], collectionData.musics);
      }
    }
  };

  const handlePlaySingle = (music) => {
    playTrack(music, collectionData.musics);
  };

  if (isLoading) {
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
      {/* 头部信息区域 */}
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
              <img src={collectionData.user.userAvatarFileUrl} alt={collectionData.user.userNickName?collectionData.user.userNickName:collectionData.user.userName} className="user__avatar" />
              <span>{collectionData.user.userNickName?collectionData.user.userNickName:collectionData.user.userName}</span>
            </div>
            <span className="meta__song-count">{collectionData.collectionMusicsNumber} 首歌</span>
          </div>
          <div className="header__actions">
            <button className="action-button play-all" onClick={handlePlayAll}>
              {isCurrentCollectionPlaying && isPlaying ? <FaPause /> : <FaPlay />}
              {isCurrentCollectionPlaying && isPlaying ? '暂停' : '播放全部'}
            </button>
          </div>
        </div>
      </header>

      {/* 歌曲列表区域 */}
      <main className="music-list-container">
        <ul>
          {collectionData.musics && collectionData.musics.map(music => (
            <MusicListItemHistoryLongVer
              key={music.musicId}
              music={music}
              width="100%"
              onPlay={() => handlePlaySingle(music)}
              isPlaying={currentTrack?.musicId === music.musicId && isPlaying}
            />
          ))}
        </ul>
      </main>
    </div>
  );
};

export default HistoryInfo;