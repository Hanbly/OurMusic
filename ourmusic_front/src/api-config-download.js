import axios from "axios";

// 1. 定义后端代理服务的基地址
const BACKEND_PROXY_BASE_URL = 'http://localhost:8080/api/files/download';

// 2. 定义需要被拦截和转换的 MinIO URL 前缀
const MINIO_URL_PREFIX = 'http://localhost:9000/om-files';

const axiosDownload = axios.create({
//   baseURL: "http://localhost:8080",
  timeout: 10000,
});

// 添加请求拦截器
axiosDownload.interceptors.request.use(
  (config) => {
    const authDataString = localStorage.getItem("userData");
    if (authDataString) {
      const authData = JSON.parse(authDataString);
      if (authData.accessToken) {
        config.headers.Authorization = `Bearer ${authData.accessToken}`;
      }
    }

    if (config.url && config.url.startsWith(MINIO_URL_PREFIX)) {
      console.log(`[Request Interceptor] Intercepted MinIO URL: ${config.url}`);
      const resourcePath = config.url.substring(MINIO_URL_PREFIX.length);
      const newUrl = `${BACKEND_PROXY_BASE_URL}${resourcePath}`;
      config.url = newUrl;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosDownload;
