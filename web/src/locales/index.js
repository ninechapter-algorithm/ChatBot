import enUS from "./en-US";
import koKR from "./ko-KR";
import zhCN from "./zh-CN";
import zhTW from "./zh-TW";
import ruRU from "./ru-RU";
import { createI18n } from "vue-i18n";
import { useAppStoreWithOut } from "../stores";
import { storeToRefs } from "pinia";

let appStore;

let defaultLocale;

// 创建i18n实例对象
const i18n = createI18n({
  // 默认语言
  locale: defaultLocale,
  // 回退语言
  fallbackLocale: "en-US",
  // 翻译消息的对象 键为语言环境标识符 值为语言对应的翻译消息
  messages: {
    "en-US": enUS,
    "ko-KR": koKR,
    "ru-RU": ruRU,
    "zh-CN": zhCN,
    "zh-TW": zhTW,
  },
});

// 安装和配置i18n
export const setupI18n = (app) => {
  appStore = useAppStoreWithOut();
  const { locale } = storeToRefs(appStore);
  defaultLocale = locale.value || "zh-CN";
  app.use(i18n);
};

// 翻译函数
export const t = i18n.global.t;

// 设置全局的语言环境
export const setLocale = (lang) => {
  i18n.global.locale = lang;
};

export default i18n;
