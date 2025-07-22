import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaTrash } from "react-icons/fa";

import axiosClient from "../../../api-config";
import { AuthContext } from "../../../context/auth-context";
import { useAudio } from "../../../context/audio-context";

import "./MusicListItemHistoryLongVer.css";

const MusicListItemHistoryLongVer = (props) => {
  const { music, musicList, width = "100%" } = props;
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const auth = useContext(AuthContext);

  const isThisTrackPlaying =
    currentTrack?.musicId === music.musicId && isPlaying;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const handlePlayAndRecordHistory = (musicTrack, trackList) => {
    playTrack(musicTrack, trackList, auth.userId);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    axiosClient.delete(`api/data-stats/collect/MUSIC/${music.musicId}/user/${auth.userId}/history`).then(() => {
      alert("成功删除音乐记录");
      window.location.reload();
    })
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("ja-JP");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <li className="long-music-item" style={{ width: width }}>
      <div
        className="long-music-item__image"
        onClick={() => handlePlayAndRecordHistory(music, musicList)}
      >
        <img src={music.musicImageFileUrl} alt={music.musicName} />
        <div className={`play-overlay ${isThisTrackPlaying ? "playing" : ""}`}>
          {!isThisTrackPlaying ? (
            <FaPlay />
          ) : (
            <div className="sound-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>

      <div className="long-music-item__info-container">
        <Link
          to={auth.userId ? `/${music.musicId}/musicInfo` : ""}
          className="long-music-item__link"
          onClick={(e) => {
            if (!auth.userId) {
              e.preventDefault();
              auth.openLoginModal();
            }
          }}
        >
          <div className="long-music-item__info long-music-item__info--name">
            <span
              title={music.musicName}
              className={`title ${isThisTrackPlaying ? "playing" : ""}`}
            >
              {music.musicName}
            </span>
          </div>
          <div className="long-music-item__info long-music-item__info--artist">
            <span className="artist" title={music.musicArtist}>
              {music.musicArtist}
            </span>
          </div>
          <div className="long-music-item__info long-music-item__info--album">
            <span className="artist" title={music.musicAlbum}>
              {music.musicAlbum}
            </span>
          </div>
          <div className="long-music-item__info long-music-item__info--timestamp">
            <span className="timestamp">
              {formatDate(music.musicTimestamp)}
            </span>
          </div>
        </Link>
      </div>

      <div className="long-music-item__actions">
        <button
          onClick={handleDelete}
          className="icon-button delete-button"
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </li>
  );
};

export default MusicListItemHistoryLongVer;
