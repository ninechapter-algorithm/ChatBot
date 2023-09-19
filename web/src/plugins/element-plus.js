// 引入ElementPlus的组件或插件
import { ElLoading, ElScrollbar } from "element-plus";

// 定义需要使用的插件集合
const plugins = [ElLoading];

// 定义需要注册的组件集合
const components = [ElScrollbar];

// 对外暴露设置ElementPlus的函数
export const setupElementPlus = (app) => {
  // 将每一个插件都安装到Vue应用程序中
  plugins.forEach((plugin) => {
    app.use(plugin);
  });

  // 将每一个组件都注册到Vue应用程序中
  components.forEach((component) => {
    app.component(component.name, component);
  });
};
