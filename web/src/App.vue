<template>
  <el-config-provider :locale="language" :button="{ autoInsertSpace: true }">
    <router-view class="h-full" />
  </el-config-provider>
</template>

<script setup>
import zhCn from "element-plus/dist/locale/zh-cn.min.mjs";
import zhTw from "element-plus/dist/locale/zh-tw.min.mjs";
import en from "element-plus/dist/locale/en.min.mjs";
import ko from "element-plus/dist/locale/ko.min.mjs";
import ru from "element-plus/dist/locale/ru.min.mjs";
import { computed } from "vue";
import { useAppStore } from "./stores";
import { storeToRefs } from "pinia";
import { setLocale } from "./locales";

const appStore = useAppStore();
const { locale } = storeToRefs(appStore);

const language = computed(() => {
  switch (locale.value) {
    case "zh-CN":
      setLocale("zh-CN");
      return zhCn;
    case "zh-TW":
      setLocale("zh-TW");
      return zhTw;
    case "en-US":
      setLocale("en-US");
      return en;
    case "ko-KR":
      setLocale("ko-KR");
      return ko;
    case "ru-RU":
      setLocale("ru-RU");
      return ru;
    default:
      setLocale("zh-CN");
      return zhCn;
  }
});
</script>
