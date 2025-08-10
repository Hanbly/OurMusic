import React, { useState, createContext, useEffect, useCallback } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  userName: null,
  userImage: null,
  userRoles: null,
  accessToken: null,
  refreshToken: null,
  isAuthLoading: true, // 新增：默认认证状态为加载中
  login: (userData) => {},
  logout: () => {},
  updateUserData: (newData) => {},
  isLoginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

export const AuthProvider = (props) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [userRoles, setUserRoles] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // 新增：认证加载状态

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const login = useCallback((userData) => {
    const {
      userId,
      userName,
      userImageFileUrl,
      userImage,
      userRoles,
      accessToken,
      refreshToken,
    } = userData;

    const finalUserImage = userImageFileUrl || userImage;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUserId(userId);
    setUserName(userName);
    setUserImage(finalUserImage);
    setUserRoles(userRoles);

    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: userId,
        userName: userName,
        userImage: finalUserImage,
        userRoles: userRoles,
        accessToken: accessToken,
        refreshToken: refreshToken,
        accTimeout: new Date().getTime() + 6 * 60 * 60 * 1000,
        reTimeout: new Date().getTime() + 3 * 24 * 60 * 60 * 1000,
      })
    );
  }, []);

  const logout = useCallback(() => {
    setUserId(null);
    setUserName(null);
    setUserImage(null);
    setUserRoles(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("userData");
  }, []);

  const updateUserData = useCallback((newData) => {
    if (newData.userName !== undefined) setUserName(newData.userName);
    if (newData.userImage !== undefined) setUserImage(newData.userImage);
    if (newData.userRoles !== undefined) setUserRoles(newData.userRoles);

    const storedDataString = localStorage.getItem("userData");
    if (storedDataString) {
      const storedData = JSON.parse(storedDataString);
      const updatedData = { ...storedData, ...newData };
      localStorage.setItem("userData", JSON.stringify(updatedData));
    }
  }, []);

  useEffect(() => {
    const storedDataString = localStorage.getItem("userData");
    if (storedDataString) {
      try {
        const storedData = JSON.parse(storedDataString);
        if (
          storedData.reTimeout &&
          storedData.reTimeout > new Date().getTime()
        ) {
          login(storedData);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    // 关键修改：无论如何，在初次检查后，认证加载过程都结束了
    setIsAuthLoading(false);
  }, [login, logout]);

  const contextValue = {
    isLoggedIn: !!accessToken,
    accessToken: accessToken,
    refreshToken: refreshToken,
    userId: userId,
    userName: userName,
    userImage: userImage,
    userRoles: userRoles,
    isAuthLoading: isAuthLoading, // 新增：将加载状态提供给 context
    login: login,
    logout: logout,
    updateUserData: updateUserData,
    isLoginModalOpen: isLoginModalOpen,
    openLoginModal: openLoginModal,
    closeLoginModal: closeLoginModal,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};