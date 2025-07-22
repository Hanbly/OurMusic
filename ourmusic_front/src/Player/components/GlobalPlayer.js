import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAudio } from "../../context/audio-context";
import { AuthContext } from "../../context/auth-context";
import DropdownMenuContent from "../../shared/components/UI/DropdownMenuContent";
import CollectionModal from "../../shared/components/EditModal/CollectModal";
import PlaylistModal from "../../shared/components/PlaylistModal/PlaylistModal"
import { MdOutlineReplay } from "react-icons/md";
import { FaPlay, FaPause } from "react-icons/fa";
import { RiReplay15Line } from "react-icons/ri";
import { IoPlayBackOutline, IoPlayForwardOutline } from "react-icons/io5";
import { BsCollectionPlay } from "react-icons/bs";
import { RiOrderPlayLine } from "react-icons/ri";
import { FaVolumeUp, FaVolumeDown, FaVolumeMute } from "react-icons/fa";
import { BsRepeat1, BsRepeat, BsShuffle } from "react-icons/bs";
import axiosDownload from "../../api-config-download";

import "./GlobalPlayer.css";

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return "00:00";
  const floorSeconds = Math.floor(seconds);
  const min = Math.floor(floorSeconds / 60);
  const sec = floorSeconds % 60;
  return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
};

const GlobalPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    replay,
    rewind15,
    currentTime,
    duration,
    progress,
    seek,
    volume,
    isMuted,
    changeVolume,
    toggleMute,
    PlayModes,
    playMode,
    togglePlayMode,
    addTrackToList,
  } = useAudio();
  const auth = useContext(AuthContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false); // 新增状态

  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const playlistBtnRef = useRef(null); // 新增 ref

  const handleProgressDrag = (e) => {
    const progressBar = progressBarRef.current;
    if (!progressBar || !duration) return;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, offsetX / rect.width));
    seek(newProgress * duration);
    const handleMouseMove = (moveEvent) => {
      const moveOffsetX = moveEvent.clientX - rect.left;
      const newMoveProgress = Math.max(
        0,
        Math.min(1, moveOffsetX / rect.width)
      );
      seek(newMoveProgress * duration);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleVolumeDrag = (e) => {
    const volumeBar = volumeBarRef.current;
    if (!volumeBar) return;
    const rect = volumeBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, offsetX / rect.width));
    changeVolume(newVolume);
    const handleMouseMove = (moveEvent) => {
      const moveOffsetX = moveEvent.clientX - rect.left;
      const newMoveVolume = Math.max(0, Math.min(1, moveOffsetX / rect.width));
      changeVolume(newMoveVolume);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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

  if (!currentTrack) {
    return null;
  }

  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <FaVolumeMute />;
    if (volume < 0.5) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  const PlayModeIcon = () => {
    switch (playMode) {
      case PlayModes.SINGLE_REPEAT:
        return <BsRepeat1 />;
      case PlayModes.SHUFFLE:
        return <BsShuffle />;
      case PlayModes.LIST_LOOP:
      default:
        return <BsRepeat />;
    }
  };

  const getPlayModeTitle = () => {
    switch (playMode) {
      case PlayModes.SINGLE_REPEAT:
        return "单曲循环";
      case PlayModes.SHUFFLE:
        return "随机播放";
      case PlayModes.LIST_LOOP:
      default:
        return "列表循环";
    }
  };

  const handleAddToPlaylist = (track) => {
    addTrackToList(track);
    alert(`已将《${track.musicName}》添加到播放列表。`);
  };

  const handleCollect = (track) => {
    if (!auth.userId) {
      auth.openLoginModal();
      return;
    }
    setShowCollectionModal(true);
    setIsMenuOpen(false);
  };

  const handleShare = (track) => {
    alert(`准备分享《${track.musicName}》。`);
  };

  const handleDownload = (track) => {
    axiosDownload
      .get(`${track.musicFileUrl}?musicId=${track.musicId}&userId=${auth.userId}`, {
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${track.musicName}${getFileExtensionWithRegex(track.musicFileUrl)}`
        );
        document.body.appendChild(link);
        link.click();
      });
  };
  function getFileExtensionWithRegex(filename) {
    if (typeof filename !== "string") {
      return "";
    }
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0] : "";
  }

  const handleCollectSuccess = () => {
    alert(`歌曲《${currentTrack.musicName}》收藏成功！`);
  };

  const triggerRect = triggerRef.current?.getBoundingClientRect();

  return (
    <>
      {currentTrack && (
        <CollectionModal
          show={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          music={currentTrack}
          userId={auth.userId}
          onSuccess={handleCollectSuccess}
        />
      )}

      {showPlaylist &&
        createPortal(
          <PlaylistModal
            triggerRef={playlistBtnRef}
            onClose={() => setShowPlaylist(false)}
          />,
          document.getElementById("portal-root")
        )}

      <div className="global-player-bar">
        <div
          className="progress-bar-container"
          ref={progressBarRef}
          onMouseDown={handleProgressDrag}
        >
          <div className="progress-bar-bg"></div>
          <div
            className="progress-bar-fg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="player-track-details">
          <Link to={`/${currentTrack.musicId}/musicInfo`}>
            <img
              className="player-album-art"
              src={currentTrack.musicImageFileUrl}
              alt={currentTrack.musicName}
            />
            <div className="player-track-info">
              <p className="player-track-name">{currentTrack.musicName}</p>
              <p className="player-artist-name">
                {currentTrack.musicArtist} - {currentTrack.musicAlbum}
              </p>
              <p className="player-track-duration">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </Link>
        </div>

        <div className="player-controls">
          <button
            title="重播"
            className="player-button secondary"
            onClick={replay}
          >
            <MdOutlineReplay />
          </button>
          <button
            title="快退15秒"
            className="player-button secondary"
            onClick={rewind15}
          >
            <RiReplay15Line />
          </button>
          <button
            title="上一首"
            className="player-button"
            onClick={playPrevious}
          >
            <IoPlayBackOutline />
          </button>
          <button
            title={isPlaying ? "暂停" : "播放"}
            className="player-button play-pause-button"
            onClick={togglePlayPause}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button title="下一首" className="player-button" onClick={playNext}>
            <IoPlayForwardOutline />
          </button>
          <button
            ref={playlistBtnRef} // 绑定 ref
            title="播放列表"
            className="player-button secondary"
            onClick={() => setShowPlaylist((prev) => !prev)} // 修改 onClick
          >
            <BsCollectionPlay />
          </button>
          <button
            title={getPlayModeTitle()}
            className="player-button secondary"
            onClick={togglePlayMode}
          >
            <PlayModeIcon />
          </button>
        </div>

        <div className="player-extra-controls">
          <div className="volume-controls">
            <button title="静音" className="player-button" onClick={toggleMute}>
              <VolumeIcon />
            </button>
            <div
              className="volume-slider-container"
              ref={volumeBarRef}
              onMouseDown={handleVolumeDrag}
            >
              <div className="volume-slider-bg"></div>
              <div
                className="volume-slider-fg"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="player-menu-container">
            <button
              ref={triggerRef}
              title="更多操作"
              className="player-button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <RiOrderPlayLine />
            </button>
            {isMenuOpen &&
              triggerRect &&
              createPortal(
                <div
                  ref={menuRef}
                  style={{
                    position: "fixed",
                    bottom: `${window.innerHeight - triggerRect.top + 8}px`,
                    right: `${window.innerWidth - triggerRect.right}px`,
                    zIndex: 1100,
                  }}
                >
                  <DropdownMenuContent
                    music={currentTrack}
                    onClose={() => setIsMenuOpen(false)}
                    onAddToPlaylist={handleAddToPlaylist}
                    onCollect={handleCollect}
                    onShare={handleShare}
                    onDownload={handleDownload}
                  />
                </div>,
                document.getElementById("portal-root")
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalPlayer;