import React from "react";

import MusicOutput from "../../musics/components/MusicOutput";

const Menu = () => {
  return (
    <div className="menu-background">
      <MusicOutput musicKey="Recommend" keyValue="华语流行" width="95%" />
      <MusicOutput musicKey="Recommend" keyValue="欧美流行" width="95%" />
      <MusicOutput musicKey="Recommend" keyValue="J-POP" width="95%" />
      <MusicOutput musicKey="Recommend" keyValue="纯音乐" width="95%" />
    </div>
  );
};

export default Menu;
