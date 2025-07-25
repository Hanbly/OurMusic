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

const MusicOutput = ({
  musics, // 从props接收音乐列表
  isLoading, // 从props接收加载状态
  error, // 从props接收错误信息
  musicKey,
  keyValue,
  width = "600px",
}) => {
  const [title, setTitle] = useState("加载中...");
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const auth = useContext(AuthContext);
  const { playTrack } = useAudio();

  const handlePlayAll = () => {
    if (filteredMusics && filteredMusics.length > 0) {
      const firstMusic = filteredMusics[0];
      playTrack(firstMusic, filteredMusics);
    }
  };

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

  // Effect to set title based on props
  useEffect(() => {
    if (musicKey === "Recommend") {
      setTitle(`${keyValue}`);
    } else if (musicKey === "Shared") {
      setTitle(`音乐分享`);
    }
  }, [musicKey, keyValue]);

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
  }, [musics]);

  const filteredMusics =
    musics?.filter((item) => {
      const term = searchTerm.toLowerCase();
      const title = (item.musicName || "").toLowerCase();
      const artist = (item.musicArtist || "").toLowerCase();
      const album = (item.musicAlbum || "").toLowerCase();
      return title.includes(term) || artist.includes(term) || album.includes(term);
    }) || [];

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
    if (isLoading) {
      return (
        <div className="center">
          <h2>加载中...</h2>
        </div>
      );
    }

    if (error && (!musics || musics.length === 0)) {
        return (
            <div className="center">
                <h2>{error}</h2>
            </div>
        )
    }

    if (filteredMusics.length === 0) {
      return (
        <div className="center">
          <h2>{searchTerm ? "没有匹配结果" : "哎呀，这里什么都没有"}</h2>
        </div>
      );
    }

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
      userId: auth.userId,
    });
  };

  const showScrollControls = musicKey === "Recommend";

  return (
    <div className={className} style={{ width: width }}>
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