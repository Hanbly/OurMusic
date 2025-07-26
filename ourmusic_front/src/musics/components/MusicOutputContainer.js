import React, { useState, useEffect, useContext } from "react";
import axiosClient from "../../api-config";
import MusicOutput from "./MusicOutput";
import { useAudio } from "../../context/audio-context"; // 引入 audio context
import { AuthContext } from "../../context/auth-context"; // 引入 auth context

// 这个组件是“智能”的，它负责获取数据和处理事件
const MusicOutputContainer = ({ musicKey, keyValue, width }) => {
  const [musics, setMusics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("加载中..."); // 新增: 标题状态

  // 获取 context
  const { playTrack } = useAudio();
  const auth = useContext(AuthContext);

  useEffect(() => {
    // 根据 props 设置标题
    if (musicKey === "Recommend") {
      setTitle(keyValue); // 推荐列表的标题就是 keyValue, e.g., "华语流行"
    } else if (musicKey === "Shared") {
      setTitle(`音乐分享`);
    }

    const fetchMusicData = async () => {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      let url = "";
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
  }, [musicKey, keyValue]);

  // --- 新增: 表头事件处理函数 ---
  const handlePlayAll = (musicList) => {
    if (musicList && musicList.length > 0) {
      playTrack(musicList[0], musicList);
    }
  };

  const handleSearchGenre = () => {
    // 这里的逻辑与您最初在 MusicOutput 中的逻辑相同
    axiosClient.post("/api/search", {
      searchContent: keyValue,
      searchType: "NEGATIVE",
      userId: auth.userId,
    });
  };

  // 将所有需要的数据和函数作为 props 传递给 MusicOutput
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
