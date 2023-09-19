import "./styles/global.less";

import { createApp } from "vue";
import { setupStore } from "./stores";
import { setupRouter } from "./router";
import { setupAssets } from "./plugins/assets";
import { setupElementPlus } from "./plugins/element-plus";
import { setupI18n } from "./locales";

import App from "./App.vue";

const bootstrap = async () => {
  const app = createApp(App);

  setupAssets();

  setupStore(app);
  setupElementPlus(app);

  setupI18n(app);

  await setupRouter(app);

  app.mount("#app");
};

bootstrap();
