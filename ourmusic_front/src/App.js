import React, { useContext } from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import { AuthContext } from "./context/auth-context";
import LoginAlertPage from "./shared/components/LoginAlert/LoginAlertPage";
import MainNavigation from "./shared/components/navigation/MainNavigation";

import Menu from "./shared/pages/Menu";
import UserInfo from "./users/pages/UserInfo";
import MusicDisplay from "./musics/pages/MusicDisplay";
import MyMusics from "./users/pages/MyMusics";
import CollectionInfo from "./collects/pages/CollectionInfo";
import HistoryInfo from "./collects/pages/HistoryInfo";
import MusicNormalSearch from "./musics/pages/MusicNormalSearch";
import MusicGenreSearch from "./musics/pages/MusicGenreSearch";
import PasswordResetPage from "./users/pages/PasswordResetPage";

// --- 引入全局播放器组件 ---
import GlobalPlayer from "./Player/components/GlobalPlayer";

const App = () => {
  const auth = useContext(AuthContext);

  return (
    // 使用 React.Fragment <>...</> 来包裹多个同级元素
    <>
      <MainNavigation>
        <Switch>
          <Route path="/" exact={true}>
            <Menu />
          </Route>
          <Route path="/:userId/userInfo" exact={true}>
            <UserInfo />
          </Route>
          <Route path="/:musicId/musicInfo" exact={true}>
            <MusicDisplay />
          </Route>
          <Route path="/:userId/myMusics" exact={true}>
            <MyMusics />
          </Route>
          <Route path="/:collectionId/collectionInfo" exact={true}>
            <CollectionInfo />
          </Route>
          <Route path="/:userId/historyInfo" exact={true}>
            <HistoryInfo />
          </Route>
          <Route path="/s/:searchKey" exact={true}>
            <MusicNormalSearch />
          </Route>
          <Route path="/g/:genreName" exact>
            <MusicGenreSearch />
          </Route>
          <Route path="/reset-password/:token">
            <PasswordResetPage />
          </Route>
          <Redirect to="/" />
        </Switch>
      </MainNavigation>

      {/* 登录提示弹窗 */}
      <LoginAlertPage
        show={auth.isLoginModalOpen}
        onClose={auth.closeLoginModal}
      />
      {/* 作为一个独立的、始终存在的组件，与主导航和弹窗同级 */}
      <GlobalPlayer />
    </>
  );
};

export default App;
