import React from "react";

import MusicOutputContainer from "../../musics/components/MusicOutputContainer";

const Menu = () => {
  return (
    <div className="menu-background">
      <MusicOutputContainer musicKey="Recommend" keyValue="华语流行" width="95%" />
      <MusicOutputContainer musicKey="Recommend" keyValue="欧美流行" width="95%" />
      <MusicOutputContainer musicKey="Recommend" keyValue="J-POP" width="95%" />
      <MusicOutputContainer musicKey="Recommend" keyValue="纯音乐" width="95%" />
    </div>
  );
};

export default Menu;
