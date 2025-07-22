import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";

import axiosClient from "../../api-config";
import { useAudio } from "../../context/audio-context";
import { AuthContext } from "../../context/auth-context";

import MusicRecommendList from "./MusicRecommendList";
import MusicSharedList from "./MusicSharedList";
import "./MusicOutput.css";

// 数据获取函数，已移除 Collection 相关逻辑
const fetchMusicData = async (musicKey, keyValue) => {
  const API_BASE_URL = "/api/music/batch";
  const params = new URLSearchParams();

  switch (musicKey) {
    case "Recommend":
      if (keyValue) params.set("musicGenre", keyValue);
      break;
    case "Shared":
      if (keyValue) params.set("userId", keyValue);
      break;
    default:
      // 如果没有匹配的 key，则不添加参数
      break;
  }

  let url = [];
  if (musicKey === "Recommend") {
    url = `${API_BASE_URL}?${params.toString()}&mode=recommend`;
  } else if (musicKey === "Shared") {
    url = `${API_BASE_URL}-by-user?${params.toString()}&mode=normal`;
  }

  if (musicKey === "Recommend") {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result && result.code === 200 && Array.isArray(result.data)) {
        console.log("Fetched music data:", result.data);
        // 将后端返回的音乐数据格式映射到前端组件需要的数据格式
        return result.data.map((music) => ({
          id: music.musicId,
          title: music.musicName,
          cd: music.musicAlbum,
          artist: music.musicArtist,
          image: music.musicImageFileUrl,
          sound: music.musicFileUrl,
          like: music.musicLikedCount,
          dislike: music.musicDislikedCount,
          share: music.musicSharedCount,
          comment: music.musicCommentedCount,
          commentlist: [],
          ...music,
        }));
      } else {
        console.error("API response format is incorrect:", result);
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch music data:", error);
      return [];
    }
  } else if (musicKey === "Shared") {
    try {
      return await axiosClient.get(url).then((response) => {
        if (
          response.data &&
          response.data.code === 200 &&
          response.data.message === "success"
        ) {
          // 将后端返回的音乐数据格式映射到前端组件需要的数据格式
          return response.data.data.map((music) => ({
            musicId: music.musicId,
            musicName: music.musicName,
            musicArtist: music.musicArtist,
            musicAlbum: music.musicAlbum,
            musicImageFileUrl: music.musicImageFileUrl,
            musicFileUrl: music.musicFileUrl,
            musicLikedCount: music.musicLikedCount,
            musicDislikedCount: music.musicDislikedCount,
            musicSharedCount: music.musicSharedCount,
            musicCommentedCount: music.musicCommentedCount,
            commentlist: [],
            ...music,
          }));
        } else if (response.data && response.data.code !== 200) {
          return [];
        }
      });
    } catch (error) {
      console.error("获取分享信息失败:", error);
      return [];
    }
  }
};

const MusicOutput = (props) => {
  const { musicKey, keyValue, width="600px" } = props;
  // 状态已重命名回 'musics'
  const [musics, setMusics] = useState([]);
  const [title, setTitle] = useState("加载中...");
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const auth = useContext(AuthContext);

  let music;
  const { playTrack } = useAudio();
  const handlePlayAll = () => {
    if (filteredMusics && filteredMusics.length > 0) {
      music = filteredMusics[0];
      playTrack(music, filteredMusics);
    }
  };

  // className 逻辑已移除 Collection
  let className = "music-output-section";
  switch (musicKey) {
    case "Recommend":
      className += " music-recommend-section";
      break;
    case "Shared":
      className += " music-shared-section";
      break;
    default:
      break;
  }

  // Effect to fetch data when key/value changes
  useEffect(() => {
    // 标题设置已移除 Collection
    if (musicKey === "Recommend") {
      setTitle(`${keyValue}`);
    } else if (musicKey === "Shared") {
      setTitle(`音乐分享`);
    }

    const loadData = async () => {
      setLoading(true);
      const data = await fetchMusicData(musicKey, keyValue);
      setMusics(data || []);
      setLoading(false);
    };

    loadData();
  }, [musicKey, keyValue]);

  // --- 滚动逻辑 ---
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const scrollEndReached = scrollLeft >= scrollWidth - clientWidth - 1;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(!scrollEndReached);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setTimeout(checkScrollability, 100);
      container.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);

      return () => {
        container.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [musics]); // 依赖于 'musics' 数组的变化

  const filteredMusics = musics
    ? musics.filter((item) => {
        const term = searchTerm.toLowerCase();
        const title = (item.musicName || "").toLowerCase();
        const artist = (item.musicArtist || "").toLowerCase();
        const album = (item.musicAlbum || "").toLowerCase();
        return title.includes(term) || artist.includes(term) || album.includes(term);
      })
    : [];

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const renderMusicList = () => {
    if (loading) {
      return (
        <div className="center">
          <h2>加载中...</h2>
        </div>
      );
    }

    if (filteredMusics.length === 0) {
      return (
        <div className="center">
          <h2>{searchTerm ? "没有匹配结果" : "哎呀，这里什么都没有"}</h2>
        </div>
      );
    }

    // renderMusicList 已移除 Collection case
    switch (musicKey) {
      case "Shared":
        return <MusicSharedList allmusic={filteredMusics} />;
      case "Recommend":
        return (
          <div className="grid-scroll-viewport" ref={scrollContainerRef}>
            <MusicRecommendList allmusic={filteredMusics} />
          </div>
        );
      default:
        return <p>未知的列表类型</p>;
    }
  };

  const handleSearchGenre = () => {
    axiosClient.post("/api/search", { 
      searchContent: keyValue,
      searchType: "NEGATIVE",
      userId: auth.userId
    });
  }

  const showScrollControls = musicKey === "Recommend";

  return (
    <div className={className} style={{width: width}}>
      <div className="section-header">
        <h3 className="section-title">{title}</h3>
        {showScrollControls && (
          <div className="scroll-controls">
            <ul className="more-links">
              <li>
                <button
                  className="action-button play-all"
                  onClick={handlePlayAll}
                >
                  <FaPlay />
                  播放全部
                </button>
              </li>
              <li>
                <Link
                  className="more-link"
                  to={`/g/${keyValue}`}
                  title="查看更多"
                  onClick={() => handleSearchGenre()}
                >
                  More
                </Link>
              </li>
              <li>
                <button
                  className="arrow left-arrow"
                  onClick={() => handleScroll("left")}
                  disabled={!canScrollLeft}
                >
                  <BsChevronLeft />
                </button>
              </li>
              <li>
                <button
                  className="arrow right-arrow"
                  onClick={() => handleScroll("right")}
                  disabled={!canScrollRight}
                >
                  <BsChevronRight />
                </button>
              </li>
            </ul>
          </div>
        )}

        {!showScrollControls && (
          <div className="section-search">
            <input
              type="text"
              placeholder="筛选音乐名称、艺术家或专辑"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>
      {renderMusicList()}
    </div>
  );
};

export default MusicOutput;
