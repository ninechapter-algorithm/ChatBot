import { createPinia } from "pinia";

// 创建 store 实例并对外暴露
export const store = createPinia();

// 创建开启 Pinia 的方法并对外暴露
export const setupStore = (app) => {
  app.use(store);
};

// 对外暴露所有模块
export * from "./modules";
