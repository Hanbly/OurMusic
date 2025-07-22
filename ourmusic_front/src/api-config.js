import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
});

// 添加请求拦截器
axiosClient.interceptors.request.use(
  (config) => {
    const authDataString = localStorage.getItem("userData");
    if (authDataString) {
      const authData = JSON.parse(authDataString);
      if (authData.accessToken) {
        config.headers.Authorization = `Bearer ${authData.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)

  // if (userData) {
  //   try {
  //     const parsedData = JSON.parse(userData);
  //     // token 是否过期
  //     if (new Date().getTime() < parsedData.accTimeout) {
  //       // 检查 accessToken 是否过期
  //       console.log("accessToken 未过期");
  //       if (accessToken) {
  //         // 注意这里的格式是 'Bearer ' + accessToken
  //         config.headers.Authorization = `Bearer ${accessToken}`;
  //       }
  //       return config; // 必须返回配置对象，否则请求会被阻塞
  //     } else {
  //       console.log("accessToken 已过期");
  //       axios
  //         .post(
  //           `/api/user/refresh?request-token=${parsedData.refreshToken}`,
  //           {
  //             refreshToken: parsedData.refreshToken, // 使用 refreshToken 获取新的 accessToken
  //           }
  //         )
  //         .then((response) => {
  //           acToken = response.data.data.accessToken;
  //           if (acToken) {
  //             // 注意这里的格式是 'Bearer ' + acToken
  //             config.headers.Authorization = `Bearer ${acToken}`;
  //             // 只更新 localStorage 中的 accessToken
  //             localStorage.setItem(
  //               "userData",
  //               JSON.stringify({
  //                 ...parsedData,
  //                 accessToken: acToken,
  //                 accTimeout: new Date().getTime() + 6 * 60 * 60 * 1000, // 更新过期时间
  //               })
  //             );
  //           }
  //           return config; // 必须返回配置对象，否则请求会被阻塞
  //         });
  //     }
  //   } catch (error) {
  //     console.error("Failed to parse auth data from localStorage", error);
  //     logout();
  //   }
  // }
);

// --- 响应拦截器 (这是关键！) ---
axiosClient.interceptors.response.use(
  // 1. 对于成功的响应 (状态码 2xx)，直接返回
  (response) => {
    return response;
  },
  // 2. 对于失败的响应 (状态码 3xx, 4xx, 5xx)，进行处理
  async (error) => {
    const originalRequest = error.config; // 保存原始请求配置
    // 检查响应是否存在，以及状态码是否为 401
    console.error("Response error:", error);
    if (error.response && error.response.status === 401) {
      // --- 这里是处理凭证过期的核心逻辑 ---
      originalRequest._retry = true; // 标记请求已被重试

      const storedDataString = localStorage.getItem("userData");
      if (!storedDataString) {
        // 如果本地没有数据，直接拒绝
        return Promise.reject(error);
      }

      const userData = JSON.parse(storedDataString);
      const refreshToken = userData.refreshToken;
      if (storedDataString) {
        if (
          error.response.data.message === "令牌已过期" &&
          refreshToken
        ) {
          try {
            const response = await axios.post(`/api/user/refresh?request-token=Bearer ${refreshToken}`);
            const newAccessToken = response.data.data.accessToken;
            const newRefreshToken = response.data.data.refreshToken;
            if (newAccessToken && newRefreshToken) {
              // 更新 localStorage 中的 accessToken
              localStorage.setItem(
                "userData",
                JSON.stringify({
                  ...JSON.parse(storedDataString),
                  accessToken: newAccessToken,
                  refreshToken: newRefreshToken,
                })
              );
              // 重新发起请求
              return axiosClient(originalRequest);
            }
          } catch (error) {
            // 如果刷新令牌也失败了，则清除本地存储
            localStorage.removeItem("userData");
          }
        }
        localStorage.removeItem("userData");
      }

      // b. 弹出提示
      // 使用一个变量防止多个请求同时401时弹出多次
      if (!window.isLoggingOut) {
        window.isLoggingOut = true;
        alert("登录凭证已过期，请重新登录！");

        // c. 重定向到登录页面
        window.location.href = "/"; // 使用 href 会刷新页面，清空所有组件状态
      }
    }

    // 3. 将错误继续传递下去，以便组件内部的 .catch() 也能捕获到
    return Promise.reject(error);
  }
);

export default axiosClient;
