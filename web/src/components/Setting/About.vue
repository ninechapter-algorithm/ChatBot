<template>
  <div v-loading="isLoading" :element-loading-text="loadingText" class="p-4 space-y-4">
    <h2 class="text-xl font-bold">Version - {{ pkg.version }}</h2>
    <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
      <p>
        此项目开源于
        <a
          class="text-blue-600 dark:text-blue-500"
          href="https://github.com/ninechapter-algorithm/ChatBot"
          target="_blank"
        >
          GitHub
        </a>
        ，免费且基于 MIT 协议，没有任何形式的付费行为！
      </p>
      <p>如果你觉得此项目对你有帮助，请在 GitHub 点个 Star 或者给予一点赞助，谢谢！</p>
    </div>
    <p>API: {{ configInfo?.apiModel ?? "-" }}</p>
    <p v-if="isChatGPTAPI">模型: {{ configInfo?.model ?? "-" }}</p>
    <p v-if="isChatGPTAPI">本月使用量: {{ configInfo?.usage ?? "-" }}</p>
    <p v-if="!isChatGPTAPI">反向代理: {{ configInfo?.reverseProxy ?? "-" }}</p>
    <p>超时时间: {{ configInfo?.timeoutMs ?? "-" }}</p>
    <p>Socks: {{ configInfo?.socksProxy ?? "-" }}</p>
    <p>Https 代理: {{ configInfo?.httpsProxy ?? "-" }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { fetchChatConfig } from "../../api";
import pkg from "../../../package.json";
import { useAuthStore } from "../../stores";

const authStore = useAuthStore();
const { isChatGPTAPI } = authStore;

const isLoading = ref(true);
const loadingText = ref("加载中...");

const configInfo = ref({
  apiModel: "",
  model: "",
  httpsProxy: "",
  reverseProxy: "",
  socksProxy: "",
  timeoutMs: -1,
  usage: "",
});

const getConfig = async () => {
  try {
    isLoading.value = true;
    const { data } = await fetchChatConfig();
    configInfo.value = data;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getConfig();
});
</script>
