import React from "react";

import "./MusicSharedList.css";

// import MusicSharedItem from "./MusicSharedItem";
import MusicListItemPublic from "../../shared/components/UI/MusicListItemPublic";

const MusicSharedList = (props) => {
  if (props.allmusic.length === 0) {
    return (
      <div className="center">
        <h2>没有找到音乐</h2>
      </div>
    );
  }
  return (
    // id: music.musicId,
    // title: music.musicName,
    // artist: music.musicArtist,
    // cd: music.musicAlbum,
    // image: music.musicImageFileUrl,
    // sound: music.musicFileUrl,
    // like: music.musicLikedCount,
    // dislike: music.musicDislikedCount,
    // share: music.musicSharedCount,
    // comment: music.musicCommentedCount,
    // commentlist: [],
    <ul className="music-shared-list">
      {props.allmusic.map((music) => (
        <MusicListItemPublic music={music} key={music.musicId} width="800px" />
      ))}
    </ul>
  );
};

export default MusicSharedList;
