import React from "react";
import { useState } from "react";

import { useAudio } from "../../context/audio-context";

import CollectionListItemPublic from "../../shared/components/UI/CollectionListItemPublic";
import "./CollectionList.css";

const CollectionList = (props) => {

  let music;
  const { playTrack } = useAudio();
  const handlePlayAll = (musics) => {
    if (musics && musics.length > 0) {
      music = musics[0];
      playTrack(music, musics);
    }
  };

  return (
    <ul className="collection-list">
      {props.allcollection.map((collection) => (
        <CollectionListItemPublic
          key={collection.id}
          collection={collection}
          onPlayAll={handlePlayAll}
          width="100%"
        />
      ))}
    </ul>
  );
};

export default CollectionList;
