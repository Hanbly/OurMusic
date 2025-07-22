import React from "react";

import "./MusicRecommendList.css";

// import MusicRecommendItem from "./MusicRecommendItem";

import MusicListItemPublic from "../../shared/components/UI/MusicListItemPublic";

const MusicRecommendList = (props) => {
  if (props.allmusic.length === 0) {
    return (
      <div className="center">
        <h2>没有找到音乐</h2>
      </div>
    );
  }
  return (
    <ul className="music-recommend-list">
      {props.allmusic.map((music) => (
        <MusicListItemPublic music={music} key={music.musicId} width="495px" />
      ))}
    </ul>
  );
};

export default MusicRecommendList;