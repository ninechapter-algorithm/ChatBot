import express from "express";
import type { RequestProps } from "./types";
import type { ChatMessage } from "./chatgpt";
import { chatConfig, chatReplyProcess, currentModel } from "./chatgpt";
import { auth } from "./middleware/auth";
import { limiter } from "./middleware/limiter";
import { isNotEmptyString } from "./utils/is";

// 创建express应用实例
const app = express();
// 创建路由实例
const router = express.Router();

// 从"public"目录下创建静态文件服务
app.use(express.static("public"));
// 解析JSON
app.use(express.json());

// 设置跨域请求头
app.all("*", (_, res, next) => {
  // 允许所有来源的请求
  res.header("Access-Control-Allow-Origin", "*");
  // 允许请求携带自定义请求头
  res.header("Access-Control-Allow-Headers", "authorization, Content-Type");
  // 允许所有HTTP方法
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// 处理"/chat-process"路由的POST请求
router.post("/chat-process", [auth, limiter], async (req, res) => {
  res.setHeader("Content-type", "application/octet-stream");

  try {
    const {
      prompt,
      options = {},
      systemMessage,
      temperature,
      top_p,
    } = req.body as RequestProps;
    let firstChunk = true;
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(
          firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`
        );
        firstChunk = false;
      },
      systemMessage,
      temperature,
      top_p,
    });
  } catch (error) {
    res.write(JSON.stringify(error));
  } finally {
    res.end();
  }
});

// 处理"/config"路由的POST请求
router.post("/config", auth, async (req, res) => {
  try {
    const response = await chatConfig();
    res.send(response);
  } catch (error) {
    res.send(error);
  }
});

// 处理"/session"路由的POST请求
router.post("/session", async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY);
    res.send({
      status: "Success",
      message: "",
      data: { auth: hasAuth, model: currentModel() },
    });
  } catch (error) {
    res.send({ status: "Fail", message: error.message, data: null });
  }
});

// 处理"/verify"路由的POST请求
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body as { token: string };
    if (!token) {
      throw new Error("Secret key is empty");
    }

    if (process.env.AUTH_SECRET_KEY !== token) {
      throw new Error("密钥无效 | Secret key is invalid");
    }

    res.send({ status: "Success", message: "Verify successfully", data: null });
  } catch (error) {
    res.send({ status: "Fail", message: error.message, data: null });
  }
});

// 应用路由中间件
app.use("", router);
app.use("/api", router);
app.set("trust proxy", 1);

// 监听端口3002
app.listen(3002, () =>
  globalThis.console.log("Server is running on port 3002")
);
