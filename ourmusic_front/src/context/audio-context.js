import React, {
  createContext,
  useState,
  useRef,
  useContext,
  useEffect,
} from "react";
import axiosClient from "../api-config";
// MODIFIED: 导入 AuthContext 以便获取 userId
import { AuthContext } from "./auth-context";

export const PlayModes = {
  LIST_LOOP: "LIST_LOOP", // 列表循环
  SINGLE_REPEAT: "SINGLE_REPEAT", // 单曲循环
  SHUFFLE: "SHUFFLE", // 随机播放
};

// 1. 创建 Context
const AudioContext = createContext();

// 辅助函数：解析 "HH:MM:SS" 字符串
const parseDurationString = (durationString) => {
  let seconds = 0;
  seconds = parseInt(durationString, 10);
  return isNaN(seconds) ? 0 : seconds;
};

// 2. 创建 Provider 组件
export const AudioProvider = ({ children }) => {
  // MODIFIED: 使用 useContext 获取 auth 对象
  const auth = useContext(AuthContext);

  const [playMode, setPlayMode] = useState(PlayModes.LIST_LOOP);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const lastVolumeRef = useRef(1);

  const audioRef = useRef(new Audio());

  const playTrack = (track, tracklist, userId) => {
    if (tracklist) {
      const newIndex = tracklist.findIndex((t) => t.musicId === track.musicId);
      setPlaylist(tracklist);
      setCurrentTrackIndex(newIndex);
    } else {
      const newIndex = playlist.findIndex((t) => t.musicId === track.musicId);
      if (newIndex !== -1) {
        setCurrentTrackIndex(newIndex);
      } else {
        setPlaylist([track]);
        setCurrentTrackIndex(0);
      }
    }
    setCurrentTrack(track);

    const preloadedDuration = track?.musicDuring
      ? parseDurationString(track.musicDuring)
      : 0;
    setDuration(preloadedDuration);

    setCurrentTime(0);
    setProgress(0);
    audioRef.current.src = track.musicFileUrl;
    audioRef.current.play();
    setIsPlaying(true);

    if (userId) {
      axiosClient
        .put(
          `/api/data-stats/collect/MUSIC/${track.musicId}/user/${userId}/history`
        )
        .catch((err) => console.error("记录播放历史失败:", err));
    }
  };

  // NEW: 新增函数，用于从播放列表点击播放
  const setCurrentTrackByIndex = (index) => {
    if (index >= 0 && index < playlist.length) {
      const trackToPlay = playlist[index];
      // 复用核心的 playTrack 函数，并传入 userId
      playTrack(trackToPlay, playlist, auth.userId);
    }
  };

  const togglePlayMode = () => {
    const modes = Object.values(PlayModes);
    const currentIndex = modes.indexOf(playMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlayMode(modes[nextIndex]);
  };

  const addTrackToList = (track) => {
    // 避免重复添加
    if (!playlist.some(pTrack => pTrack.musicId === track.musicId)) {
       setPlaylist((prevPlaylist) => [...prevPlaylist, track]);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (playlist.length <= 1) {
      replay();
      return;
    }

    let nextIndex;

    switch (playMode) {
      case PlayModes.SHUFFLE:
        do {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentTrackIndex);
        break;

      case PlayModes.SINGLE_REPEAT:
        nextIndex = (currentTrackIndex + 1) % playlist.length;
        break;

      case PlayModes.LIST_LOOP:
      default:
        nextIndex = (currentTrackIndex + 1) % playlist.length;
        break;
    }

    // MODIFIED: 传入 auth.userId 以记录历史
    playTrack(playlist[nextIndex], playlist, auth.userId);
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    const prevIndex =
      (currentTrackIndex - 1 + playlist.length) % playlist.length;
    // MODIFIED: 传入 auth.userId 以记录历史
    playTrack(playlist[prevIndex], playlist, auth.userId);
  };

  const replay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  const rewind15 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime - 15
      );
    }
  };
  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  const changeVolume = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
    setIsMuted(clampedVolume === 0);
    if (clampedVolume > 0) {
      lastVolumeRef.current = clampedVolume;
    }
  };
  const toggleMute = () => {
    if (isMuted) {
      changeVolume(lastVolumeRef.current);
    } else {
      lastVolumeRef.current = volume;
      changeVolume(0);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      if (playMode === PlayModes.SINGLE_REPEAT) {
        replay();
      } else {
        playNext();
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted || audio.volume === 0);
    };
    const handleTimeUpdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleLoadedMetadata = () => {
      if (duration === 0 && audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("volumechange", handleVolumeChange);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("volumechange", handleVolumeChange);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  // MODIFIED: 依赖项中加入 auth.userId，确保 userId 变化时能正确传递
  }, [currentTrackIndex, playlist, duration, playMode, auth.userId]); 

  const value = {
    currentTrack,
    isPlaying,
    playlist,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    replay,
    rewind15,
    audioRef,
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
    // EXPOSED: 暴露 setPlaylist 以供 PlaylistModal 使用
    setPlaylist,
    // EXPOSED: 暴露新函数以供 PlaylistModal 使用
    setCurrentTrackByIndex,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export const useAudio = () => {
  return useContext(AudioContext);
};