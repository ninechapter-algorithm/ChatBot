import { createRouter, createWebHistory } from "vue-router";
import Layout from "../layout/Layout.vue";

const routes = [
  {
    path: "/",
    name: "Root",
    component: Layout,
    redirect: "/chat",
    children: [
      {
        path: "/chat/:uuid?",
        name: "Chat",
        component: () => import("../views/chat/index.vue"),
      },
    ],
  },
  {
    path: "/500",
    name: "500",
    component: () => import("../views/errors/500.vue"),
  },
  {
    // 定义路由为/404
    path: "/404",
    name: "404",
    // 引入404.vue页面
    component: () => import("../views/errors/404.vue"),
  },
  {
    // 使用正则表达式匹配以上所有路径
    path: "/:pathMatch(.*)*",
    name: "PageNotFound",
    // 如果不存在则重定向到/404
    redirect: "/404",
  },
];

// 创建路由实例
export const router = createRouter({
  // 使用Web History模式
  history: createWebHistory(import.meta.env.BASE_URL),
  // 定义路由配置
  routes,
});

export const setupRouter = async (app) => {
  app.use(router);
  await router.isReady();
};
