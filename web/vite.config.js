import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import EsLintPlugin from "vite-plugin-eslint";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { VitePWA } from "vite-plugin-pwa";

// env: ImportMetaEnv
const setupPlugins = (env) => {
  return [
    // 使用vue插件
    vue(),
    // 使用EsLint插件
    EsLintPlugin({
      // 配置EsLint插件包含的文件
      include: ["src/**/*.js", "src/**/*.vue", "src/*.js", "src/*.vue"],
    }),
    // 使用AutoImport插件
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    // 使用Components插件
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // 当环境变量VITE_GLOB_APP_PWA的值为true时执行以下操作
    env.VITE_GLOB_APP_PWA === "true" &&
      // 使用VitePWA插件
      VitePWA({
        // 自动注入Service Worker注册代码
        injectRegister: "auto",
        // Web App Manifest的配置
        manifest: {
          // 应用名称
          name: "ChatBot",
          // 应用的短名称
          short_name: "ChatBot",
          // 应用图标的配置 包括图标的路径、尺寸和类型
          icons: [
            { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          ],
        },
      }),
  ];
};

// https://vitejs.dev/config/
export default defineConfig((config) => {
  const env = loadEnv(config.mode, process.cwd());

  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: setupPlugins(env),
    server: {
      // 指定主机地址
      host: "0.0.0.0",
      // 指定端口号
      port: 3001,
      // 是否在启动服务时自动打开浏览器
      open: false,
      cors: true,
      // 代理配置
      proxy: {
        // 针对以`/api`开头的请求进行代理
        "/api": {
          // 代理目标的基础URL
          target: env.VITE_APP_API_BASE_URL,
          // 是否修改请求的来源 true->允许跨域
          changeOrigin: true,
          // 对请求路径进行重写 /api/ -> /
          rewrite: (path) => path.replace(/^\/api\//, "/"),
        },
      },
    },
    build: {
      // 是否报告压缩后的文件大小
      reportCompressedSize: false,
      // 是否生成源映射文件
      sourcemap: false,
      // CommonJS选项
      commonjsOptions: {
        // 是否忽略在转换CommonJS模块过程中的try-catch语句
        ignoreTryCatch: false,
      },
    },
  };
});
