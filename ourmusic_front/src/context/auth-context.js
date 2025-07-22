import React, { useState, createContext, useEffect, useCallback } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  userName: null,
  userImage: null,
  userRoles: null,
  accessToken: null,
  refreshToken: null,
  // login: (uid, uname, uimage, uroles, acToken, reToken) => {},
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

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  // ---【修改点 1】--- login 函数接收一个对象
  const login = useCallback((userData) => {
    console.log("Login function called with userData:", userData);
    // 使用解构赋值，不再关心参数顺序
    const {
      userId,
      userName,
      userImageFileUrl, // 从登录API获取
      userImage,      // 从 localStorage 获取
      userRoles,
      accessToken,
      refreshToken,
    } = userData;

    // 如果是登录时，图片URL在 userImageFileUrl；如果是从 localStorage 恢复，在 userImage
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
        userImage: finalUserImage, // 统一保存为 userImage
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
        if (storedData.reTimeout && storedData.reTimeout > new Date().getTime()) {
          // ---【修改点 2】--- 调用 login 时传递整个对象
          login(storedData);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
  }, [login, logout]);

  const contextValue = {
    isLoggedIn: !!accessToken,
    accessToken: accessToken,
    refreshToken: refreshToken,
    userId: userId,
    userName: userName,
    userImage: userImage,
    userRoles: userRoles,
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