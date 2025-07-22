import React from "react";
import { Link } from "react-router-dom";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { FaRegStar, FaStar } from "react-icons/fa";

import axiosClient from "../../../api-config";

import "./MusicListItemPrivate.css";

const MusicListItemPublic = (props) => {
  const music = props.music;

  const [isLiked, setIsLiked] = React.useState(false);

  const [likeCount, setLikeCount] = React.useState(music.musicLikedCount);

  const handleLikeClick = () => {
    if (isLiked) {
      // 如果已经喜欢，则取消喜欢
      const API_LIKE_URL = `/api/music/${music.musicId}/cancelLike`;
      axiosClient
        .put(API_LIKE_URL)
        .then((response) => {
          setIsLiked(!isLiked);
          setLikeCount(likeCount - 1);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      return;
    }
    // 否则，标记为喜欢
    const API_LIKE_URL = `/api/music/${music.musicId}/like`;
    axiosClient
      .put(API_LIKE_URL)
      .then((response) => {
        setIsLiked(!isLiked);
        setLikeCount(likeCount + 1);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <li className="music-item">
      {/* 左侧图片 */}
      <div className="music-item__image">
        <img src={music.musicImage} alt={music.musicName} />
        <div className="play-overlay"></div>
      </div>

      {/* 中间信息 */}
      <Link to={`/${music.musicId}/musicInfo`} className="music-item__link">
        <div className="music-item__info">
          <span className="title">{music.musicName}</span>
          <span className="artist">{music.musicArtist}</span>
        </div>
      </Link>

      {/* 右侧操作按钮 */}
      <div className="music-item__actions">
        <button className="icon-button" onClick={handleLikeClick}>
          <span className="count-display">{likeCount}</span>
          <BiSolidLike />
        </button>
        <button className="icon-button">⋮</button>
      </div>
    </li>
  );
};

export default MusicListItemPublic;
