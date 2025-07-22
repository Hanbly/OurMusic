// MusicItem.js
import React from "react";

import "./MusicSharedItem.css";
import { Link } from "react-router-dom";

const MusicSharedItem = (props) => {
  return (
    <li className="music-shared-item">
      {/* 左侧图片 */}
      <div className="music-shared-item__image">
        <img src={props.image} alt={props.title} />
        <div className="play-overlay"></div>
      </div>

      {/* 中间信息 */}
      <Link to={`/${props.id}/musicInfo`} className="music-shared-item__link">
        <div className="music-shared-item__info">
          <span className="title">{props.title}</span>
          <span className="artist">{props.artist}</span>
        </div>
      </Link>

      {/* 右侧操作按钮 */}
      <div className="music-shared-item__actions">
        <button className="icon-button">编辑</button>
        <button className="icon-button">删除</button>
      </div>
    </li>
  );
};

export default MusicSharedItem;
