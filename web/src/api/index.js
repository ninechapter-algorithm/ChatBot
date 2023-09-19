import { post } from "../utils/request";
import { useAuthStore, useSettingStore } from "../stores";

// 发起获取对话数据的API请求
export const fetchChatAPI = (prompt, options, signal) => {
  return post({
    url: "/chat",
    data: { prompt, options },
    signal,
  });
};

// 发起获取对话配置的API请求
export const fetchChatConfig = () => {
  return post({
    url: "config",
  });
};

/**
 * 发起处理对话API的请求
 * @param {prompt, options, signal} params - 参数对象，包括提示、选项和信号
 * @returns 返回一个Promise对象
 */
export const fetchChatAPIProcess = (params) => {
  const settingStore = useSettingStore();
  const authStore = useAuthStore();

  let data = {
    prompt: params.prompt,
    options: params.options,
  };

  // 如果使用ChatGPT API，则添加系统消息、temperature和top_p参数
  if (authStore.isChatGPTAPI) {
    data = {
      ...data,
      systemMessage: settingStore.systemMessage,
      temperature: settingStore.temperature,
      top_p: settingStore.topP,
    };
  }

  return post({
    url: "/chat-process",
    data,
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  });
};

// 发起获取会话的API请求
export const fetchSession = () => {
  return post({
    url: "/session",
  });
};

// 发起验证API请求
export const fetchVerify = (token) => {
  return post({
    url: "/verify",
    data: { token },
  });
};
