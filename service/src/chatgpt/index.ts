import * as dotenv from "dotenv"; // 用于从环境变量加载配置
import "isomorphic-fetch"; // 用于在服务端和浏览器端发送fetch请求
import type {
  ChatGPTAPIOptions,
  ChatMessage,
  SendMessageOptions,
} from "chatgpt";
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from "chatgpt";
import { SocksProxyAgent } from "socks-proxy-agent"; // 用于设置SOCKS代理
import httpsProxyAgent from "https-proxy-agent"; // 用于设置HTTPS代理
import fetch from "node-fetch"; // 用于在Node.js环境中发送fetch请求
import { sendResponse } from "../utils"; // 用于发送响应
import { isNotEmptyString } from "../utils/is"; // 用于检查字符串是否非空
import type {
  ApiModel,
  ChatContext,
  ChatGPTUnofficialProxyAPIOptions,
  ModelConfig,
} from "../types";
import type { RequestOptions, SetProxyOptions, UsageResponse } from "./types";

const { HttpsProxyAgent } = httpsProxyAgent;

// 加载环境变量
dotenv.config();

// 定义一个映射
// 将错误代码映射到错误信息
const ErrorCodeMessage: Record<string, string> = {
  401: "[OpenAI] 提供错误的API密钥 | Incorrect API key provided",
  403: "[OpenAI] 服务器拒绝访问，请稍后再试 | Server refused to access, please try again later",
  502: "[OpenAI] 错误的网关 |  Bad Gateway",
  503: "[OpenAI] 服务器繁忙，请稍后再试 | Server is busy, please try again later",
  504: "[OpenAI] 网关超时 | Gateway Time-out",
  500: "[OpenAI] 服务器繁忙，请稍后再试 | Internal Server Error",
};

// 设置超时时间
// 如果环境变量中定义了TIMEOUT_MS 则使用该值
// 否则默认超时时间为100000毫秒(100秒)
const timeoutMs: number = !isNaN(+process.env.TIMEOUT_MS)
  ? +process.env.TIMEOUT_MS
  : 100 * 1000;

// 检查环境变量OPENAI_API_DISABLE_DEBUG的值是否为true
// 用于确定是否禁用调试模式
const disableDebug: boolean = process.env.OPENAI_API_DISABLE_DEBUG === "true";

let apiModel: ApiModel;

// 设置模型名称
// 如果环境变量中定义了OPENAI_API_MODEL 则使用该值
// 否则默认使用"gpt-3.5-turbo"
const model = isNotEmptyString(process.env.OPENAI_API_MODEL)
  ? process.env.OPENAI_API_MODEL
  : "gpt-3.5-turbo";

// 检查环境变量中的OPEN_API_KEY或OPENAI_ACCESS_TOKEN是否存在
// 如果都不存在 则抛出错误
if (
  !isNotEmptyString(process.env.OPENAI_API_KEY) &&
  !isNotEmptyString(process.env.OPENAI_ACCESS_TOKEN)
)
  throw new Error(
    "Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable"
  );

let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI;

(async () => {
  // 获取环境变量中OPENAI_API_BASE_URL的值
  if (isNotEmptyString(process.env.OPENAI_API_KEY)) {
    const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL;

    const options: ChatGPTAPIOptions = {
      apiKey: process.env.OPENAI_API_KEY,
      completionParams: { model },
      debug: !disableDebug,
    };

    // 如果使用gpt-4模型 则增加最大标记限制
    // maxModelTokens 模型最大token数量
    // maxResponseTokens 响应最大token数量
    if (model.toLowerCase().includes("gpt-4")) {
      // 如果是32k模型
      if (model.toLowerCase().includes("32k")) {
        options.maxModelTokens = 32768;
        options.maxResponseTokens = 8192;
      } else {
        options.maxModelTokens = 8192;
        options.maxResponseTokens = 2048;
      }
    }

    // 如果OPENAI_API_BASE_URL不为空
    if (isNotEmptyString(OPENAI_API_BASE_URL)) {
      // 则对其进行设置
      options.apiBaseUrl = `${OPENAI_API_BASE_URL}/v1`;
    }

    // 配置代理信息
    setupProxy(options);

    api = new ChatGPTAPI({ ...options });
    apiModel = "ChatGPTAPI";
  } else {
    const options: ChatGPTUnofficialProxyAPIOptions = {
      accessToken: process.env.OPENAI_ACCESS_TOKEN,
      apiReverseProxyUrl: isNotEmptyString(process.env.API_REVERSE_PROXY)
        ? process.env.API_REVERSE_PROXY
        : "https://ai.fakeopen.com/api/conversation",
      model,
      debug: !disableDebug,
    };

    // 配置代理信息
    setupProxy(options);

    api = new ChatGPTUnofficialProxyAPI({ ...options });
    apiModel = "ChatGPTUnofficialProxyAPI";
  }
})();

/**
 * 对话回复过程
 * @param options 请求选项
 * @returns {Promise} 流式响应对象
 */
async function chatReplyProcess(options: RequestOptions) {
  console.log("ChatReplyProcess, options: ", options);

  const { message, lastContext, process, systemMessage, temperature, top_p } =
    options;
  try {
    let options: SendMessageOptions = { timeoutMs };

    if (apiModel === "ChatGPTAPI") {
      if (isNotEmptyString(systemMessage)) {
        options.systemMessage = systemMessage;
      }
      options.completionParams = { model, temperature, top_p };
    }

    if (lastContext != null) {
      if (apiModel === "ChatGPTAPI") {
        options.parentMessageId = lastContext.parentMessageId;
      } else {
        options = { ...lastContext };
      }
    }

    const response = await api.sendMessage(message, {
      ...options,
      onProgress: (partialResponse) => {
        process?.(partialResponse);
      },
    });

    return sendResponse({ type: "Success", data: response });
  } catch (error: any) {
    const code = error.statusCode;
    global.console.log(error);
    if (Reflect.has(ErrorCodeMessage, code)) {
      return sendResponse({ type: "Fail", message: ErrorCodeMessage[code] });
    }
    return sendResponse({
      type: "Fail",
      message: error.message ?? "Please check the back-end console",
    });
  }
}

/**
 * 用于获取使用情况数据。
 * 它通过调用OpenAI API来获取每月使用量，并返回格式化后的使用量数据。
 * @returns {Promise<string>} 一个解析为使用量数据的Promise。
 */
async function fetchUsage() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL;

  // 如果OPENAI_API_KEY为空或未设置，则直接返回"-"
  if (!isNotEmptyString(OPENAI_API_KEY)) return Promise.resolve("-");

  // 设置API_BASE_URL，如果OPENAI_API_BASE_URL为空或未设置，则使用默认值"https://api.openai.com"
  const API_BASE_URL = isNotEmptyString(OPENAI_API_BASE_URL)
    ? OPENAI_API_BASE_URL
    : "https://api.openai.com";

  // 格式化日期，获取开始日期和结束日期
  const [startDate, endDate] = formatDate();

  // 构建每月使用量的URL
  const urlUsage = `${API_BASE_URL}/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`;

  // 设置请求头
  const headers = {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };

  // 设置代理选项
  const options = {} as SetProxyOptions;

  // 设置代理
  setupProxy(options);

  try {
    // 发起获取使用量的请求
    const useResponse = await options.fetch(urlUsage, { headers });
    if (!useResponse.ok) throw new Error("获取使用量失败");
    const usageData = (await useResponse.json()) as UsageResponse;
    const usage = Math.round(usageData.total_usage) / 100;
    // 格式化使用量数据，并返回
    return Promise.resolve(usage ? `$${usage}` : "-");
  } catch (error) {
    global.console.log(error);
    return Promise.resolve("-");
  }
}

function formatDate(): string[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const lastDay = new Date(year, month, 0);
  const formattedFirstDay = `${year}-${month.toString().padStart(2, "0")}-01`;
  const formattedLastDay = `${year}-${month
    .toString()
    .padStart(2, "0")}-${lastDay.getDate().toString().padStart(2, "0")}`;
  return [formattedFirstDay, formattedLastDay];
}

/**
 * 用于获取对话配置。
 * 它获取使用情况数据、反向代理配置、HTTPS代理配置、SOCKS代理配置，并返回包含模型配置的响应。
 * @returns {Promise<ModelConfig>} 一个解析为模型配置的Promise。
 */
async function chatConfig() {
  // 获取使用情况数据
  const usage = await fetchUsage();

  // 检查API_REVERSE_PROXY环境变量是否设置，否则使用'-'
  const reverseProxy = process.env.API_REVERSE_PROXY ?? "-";

  // 检查HTTPS_PROXY或ALL_PROXY环境变量是否设置，否则使用'-'
  const httpsProxy = (process.env.HTTPS_PROXY || process.env.ALL_PROXY) ?? "-";

  // 检查SOCKS_PROXY_HOST和SOCKS_PROXY_PORT环境变量是否设置，否则使用'-'
  const socksProxy =
    process.env.SOCKS_PROXY_HOST && process.env.SOCKS_PROXY_PORT
      ? `${process.env.SOCKS_PROXY_HOST}:${process.env.SOCKS_PROXY_PORT}`
      : "-";

  // 获取OPENAI_API_MODEL环境变量
  const model = process.env.OPENAI_API_MODEL;

  // 发送带有模型配置的响应
  return sendResponse<ModelConfig>({
    type: "Success",
    data: {
      apiModel,
      reverseProxy,
      timeoutMs,
      socksProxy,
      httpsProxy,
      usage,
      model,
    },
  });
}

/**
 * 用于配置代理
 * @param options 代理选项
 */
function setupProxy(options: SetProxyOptions) {
  // 如果环境变量中的SOCKS_PROXY_HOST和SOCKS_PROXY_PORT不为空
  if (
    isNotEmptyString(process.env.SOCKS_PROXY_HOST) &&
    isNotEmptyString(process.env.SOCKS_PROXY_PORT)
  ) {
    // 则对Socks代理进行配置 并创建代理实例
    const agent = new SocksProxyAgent({
      hostname: process.env.SOCKS_PROXY_HOST,
      port: process.env.SOCKS_PROXY_PORT,
      userId: isNotEmptyString(process.env.SOCKS_PROXY_USERNAME)
        ? process.env.SOCKS_PROXY_USERNAME
        : undefined,
      password: isNotEmptyString(process.env.SOCKS_PROXY_PASSWORD)
        ? process.env.SOCKS_PROXY_PASSWORD
        : undefined,
    });
    // 使用代理发送fetch请求
    options.fetch = (url, options) => {
      return fetch(url, { agent, ...options });
    };
  } else if (
    isNotEmptyString(process.env.HTTPS_PROXY) ||
    isNotEmptyString(process.env.ALL_PROXY)
  ) {
    // 如果环境变量中的HTTPS_PROXY或ALL_PROXY不为空
    const httpsProxy = process.env.HTTPS_PROXY || process.env.ALL_PROXY;
    if (httpsProxy) {
      // 则创建Https代理实例
      const agent = new HttpsProxyAgent(httpsProxy);
      // 使用代理发送fetch请求
      options.fetch = (url, options) => {
        return fetch(url, { agent, ...options });
      };
    }
  } else {
    // 如果都没有配置 则直接发送请求
    options.fetch = (url, options) => {
      return fetch(url, { ...options });
    };
  }
}

function currentModel(): ApiModel {
  return apiModel;
}

export type { ChatContext, ChatMessage };

export { chatReplyProcess, chatConfig, currentModel };
