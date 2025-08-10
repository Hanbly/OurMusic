import React, { useState, useEffect, useContext } from "react";
import axiosClient from "../../api-config";
import MusicOutput from "./MusicOutput";
import { useAudio } from "../../context/audio-context";
import { AuthContext } from "../../context/auth-context";

const MusicOutputContainer = ({ musicKey, keyValue, width }) => {
  const [musics, setMusics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("加载中...");

  const { playTrack } = useAudio();
  const auth = useContext(AuthContext);

  useEffect(() => {
    // 关键修改：如果认证过程还未结束，则不执行任何操作，直接返回。
    if (auth.isAuthLoading) {
      return;
    }

    if (musicKey === "Recommend") {
      setTitle(keyValue);
    } else if (musicKey === "Shared") {
      setTitle(`音乐分享`);
    }

    const fetchMusicData = async () => {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      let url = "";

      // 这里的逻辑现在只会在认证状态确定后运行
      if (auth.userId) {
        params.set("operateUserId", auth.userId);
      }

      switch (musicKey) {
        case "Recommend":
          if (keyValue) params.set("musicGenre", keyValue);
          url = `/api/music/batch?${params.toString()}&mode=recommend`;
          break;
        case "Shared":
          if (keyValue) params.set("userId", keyValue);
          url = `/api/music/batch-by-user?${params.toString()}`;
          break;
        default:
          setIsLoading(false);
          setError("未知的 musicKey");
          return;
      }

      try {
        const response = await axiosClient.get(url);
        const result = response.data;
        let musicList = [];
        if (result && result.code === 200) {
          if (result.data && Array.isArray(result.data.content)) {
            musicList = result.data.content;
          } else if (Array.isArray(result.data)) {
            musicList = result.data;
          }
        }
        if (musicList.length > 0) {
          const mappedData = musicList.map((music) => ({
            id: music.musicId,
            title: music.musicName,
            cd: music.musicAlbum,
            artist: music.musicArtist,
            image: music.musicImageFileUrl,
            sound: music.musicFileUrl,
            ...music,
          }));
          setMusics(mappedData);
        } else {
          setMusics([]);
          if (result.code !== 200) {
            setError(result.message || "加载推荐失败");
          }
        }
      } catch (err) {
        setError(err.message || "请求失败");
        setMusics([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMusicData();
    // 关键修改：依赖数组中加入 isAuthLoading
  }, [musicKey, keyValue, auth.userId, auth.isAuthLoading]);

  const handlePlayAll = (musicList) => {
    if (musicList && musicList.length > 0) {
      playTrack(musicList[0], musicList);
    }
  };

  const handleSearchGenre = () => {
    axiosClient.post("/api/search", {
      searchContent: keyValue,
      searchType: "NEGATIVE",
      userId: auth.userId,
    });
  };

  return (
    <MusicOutput
      musics={musics}
      isLoading={isLoading}
      error={error}
      musicKey={musicKey}
      keyValue={keyValue}
      width={width}
      title={title}
      onPlayAll={handlePlayAll}
      onSearchGenre={handleSearchGenre}
    />
  );
};

export default MusicOutputContainer;