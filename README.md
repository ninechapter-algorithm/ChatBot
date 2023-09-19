# ChatBot

> 声明：此项目只发布于 GitHub，免费且作为开源学习使用。如有需要此项目的相关教程，目前仅提供 **前端部分** 的完整搭建过程，可前往 [LintCode - ChatBot：工程化 Vue 前端项目搭建](https://www.lintcode.com/course/110) 获取。

## 前置要求

### 1. Node.js

项目需要 _Node.js_ 的版本为 **`^16 || ^18 || ^19`**，即 `16.x`、`18.x` 或 `19.x` 均可。

### 2. yarn

如果你没有安装过 _yarn_，可以使用 _Corepack_ 来开启：

```bash
corepack enable
```

然后再通过以下命令来更新全局的 _yarn_：

```bash
corepack prepare yarn@stable --activate
```

### 3. 填写环境变量

在使用本项目的 **后端服务** 之前，你需要获取 **OpenAI API Key** 或是 **Access Token**，并在 `/service/.env` 文件中填写本地环境变量，内容可参考 [service/.env.example](https://github.com/ninechapter-algorithm/ChatBot/blob/main/service/.env.example) 文件。

## 后端环境变量

如上文所提，启动后端服务之前需要在 `/service/.env` 文件中配置环境变量，其中 **必须** 包含的字段有：

- `OPENAI_API_KEY`：填写你的 OpenAI API Key
  - `OPENAI_API_MODEL`：**选填**，用于设置模型，默认为 "gpt-3.5-turbo"
  - `OPENAI_API_BASE_URL`：**选填**，用于设置接口地址，默认为 "https://api.openai.com"
- `OPENAI_ACCESS_TOKEN`：填写你的 OpenAI Access Token
  - `API_REVERSE_PROXY`：**选填**，用于设置反向代理，默认为 "https://bypass.churchless.tech/api/conversation"

需要注意的是，上述的 `OPENAI_API_KEY` 和 `OPENAI_ACCESS_TOKEN` 是 **二选一** 的，当两者同时配置时，**会优先使用 `OPENAI_API_KEY`**。

其它 **可选择进行配置** 的字段有：

- `MAX_REQUEST_PER_HOUR`：每小时最大请求次数，默认无限
- `TIMEOUT_MS`：超时时长，单位毫秒，默认 100 秒
- `HTTPS_PROXY`：支持 `http`，`https`, `socks5`
- `ALL_PROXY`：支持 `http`，`https`, `socks5`
- Socks 代理相关，选择配置时需要以下四个字段
  - `SOCKS_PROXY_HOST`
  - `SOCKS_PROXY_PORT`
  - `SOCKS_PROXY_USERNAME`
  - `SOCKS_PROXY_PASSWORD`

## 测试环境运行

### 后端项目

进入 `/service` 目录下，执行 `yarn` 或 `yarn install` 命令来安装依赖。等待依赖安装完毕之后，再执行 `yarn start` 命令即可启动后端项目。

![image.png](https://media-lc.lintcode.com/u_501764/202309/5aeec2b9d3aa46d8946f434107569713/image.png)

> **注意**：为确保能够正常访问 OpenAI，请务必完成配置环境变量再启动项目！

### 前端项目

来到 `/web` 目录下，首先创建 `.env` 文件并配置环境变量，可参考 `.env.example` 文件内容。然后执行 `yarn` 或 `yarn install` 命令来安装项目所需依赖。

等待依赖安装完毕之后，再执行 `yarn dev` 命令即可启动前端项目。

![dev](https://media-lc.lintcode.com/u_501764/202309/e89363c05e2b4c92a2f84aaea368bf24/image.png)
