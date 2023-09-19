import { defineStore } from "pinia";
import { ref } from "vue";
import { useDark } from "@vueuse/core";
import { ss } from "@/utils/storage";
import { store } from "..";

const LOCAL_NAME = "app-store";

export const useAppStore = defineStore("appStore", () => {
  // 侧边栏是否折叠
  const siderCollapsed = ref(false);
  // 是否为深色主题
  const isDark = useDark();
  // 多语言标识
  const locale = ref("zh-CN");

  // 从LocalStorage获取值
  (() => {
    // 获取LocalStorage中的appStore状态对象
    const localStates = ss.get(LOCAL_NAME);
    if (localStates) {
      siderCollapsed.value = localStates.siderCollapsed ?? siderCollapsed.value;
      isDark.value = localStates.isDark ?? isDark.value;
      locale.value = localStates.locale ?? locale.value;
    }
  })();

  // 将appStore的状态值存储到localStorage中
  const storeLocalStates = () => {
    ss.set(LOCAL_NAME, {
      siderCollapsed: siderCollapsed.value,
      isDark: isDark.value,
      locale: locale.value,
    });
  };

  // 设置siderCollapsed值 并更新localStorage中的状态
  const setSiderCollapsed = (collapsed) => {
    siderCollapsed.value = collapsed;
    storeLocalStates();
  };

  // 设置isDark值 并更新localStorage中的状态
  const setIsDark = (flag) => {
    isDark.value = flag;
    storeLocalStates();
  };

  // 设置locale值 并更新localStorage中的状态
  const setLocale = (lang) => {
    locale.value = lang;
    storeLocalStates();
  };

  return {
    siderCollapsed,
    isDark,
    locale,
    storeLocalStates,
    setSiderCollapsed,
    setIsDark,
    setLocale,
  };
});

export const useAppStoreWithOut = () => {
  return useAppStore(store);
};
