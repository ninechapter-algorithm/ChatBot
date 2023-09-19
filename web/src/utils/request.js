import axios from "axios";
import { useAuthStore } from "../stores";
import { storeToRefs } from "pinia";

const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 使用 useAuthStore 函数获取 authStore 对象
    const authStore = useAuthStore();
    // 从 authStore 中解构出 token 属性并转换为 ref
    const { token } = storeToRefs(authStore);
    if (token.value) {
      // 在请求头中添加授权信息
      config.headers.Authorization = `Bearer ${token.value}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error.msg);
  },
);

// 拦截响应并在返回之前处理
service.interceptors.response.use(
  // 成功处理函数
  (response) => {
    const { status } = response;
    if (status === 200) {
      // 如果响应状态为200，返回响应
      return response;
    }

    // 抛出一个带有状态码的错误字符串
    throw new Error(status.toString());
  },
  // 错误处理函数
  (error) => {
    // 使用错误拒绝Promise
    return Promise.reject(error);
  },
);

const http = ({
  url,
  data,
  method,
  headers,
  onDownloadProgress,
  signal,
  beforeRequest,
  afterRequest,
}) => {
  // 成功处理函数
  const successHandler = (res) => {
    const authStore = useAuthStore();

    // 如果响应状态为"Success"或响应数据类型为字符串，返回响应数据
    if (res.data.status === "Success" || typeof res.data === "string") {
      return res.data;
    }

    // 如果响应状态为"Unauthorized"，删除令牌并重新加载页面
    if (res.data.status === "Unauthorized") {
      authStore.removeToken();
      window.location.reload();
    }

    // 如果以上条件都不满足，拒绝Promise并返回响应数据
    return Promise.reject(res.data);
  };

  // 失败处理函数
  const failHandler = (error) => {
    afterRequest?.();
    // 抛出错误，使用错误消息或默认错误消息"Error"
    throw new Error(error?.message || "Error");
  };

  // 执行请求前的操作
  beforeRequest?.();

  // 如果未提供请求方法，默认为"GET"
  method = method || "GET";

  // 根据请求数据的类型，创建params对象
  const params = Object.assign(typeof data === "function" ? data() : data ?? {}, {});

  return method === "GET"
    ? service.get(url, { params, signal, onDownloadProgress }).then(successHandler, failHandler) // 发起GET请求并处理结果
    : service
        .post(url, params, { headers, signal, onDownloadProgress })
        .then(successHandler, failHandler); // 发起POST请求并处理结果
};

export const get = ({
  url,
  data,
  method = "GET",
  onDownloadProgress,
  signal,
  beforeRequest,
  afterRequest,
}) => {
  return http({
    url,
    method,
    data,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  });
};

export const post = ({
  url,
  data,
  method = "POST",
  headers,
  onDownloadProgress,
  signal,
  beforeRequest,
  afterRequest,
}) => {
  return http({
    url,
    method,
    data,
    headers,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  });
};

export default post;
