<template>
  <div class="flex h-full">
    <div class="px-4 m-auto space-y-4 text-center max-[400px]">
      <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
        {{ errorMap[type].title }}
      </h2>

      <p class="text-base text-center text-slate-500 dark:text-neutral-400">
        {{ errorMap[type].errorMessage }}
      </p>

      <div class="flex items-center justify-center text-center">
        <div class="w-[350px]">
          <img :src="errorMap[type].errorImage" :alt="type" />
        </div>
      </div>

      <el-button type="primary" @click="handleClick">{{ buttonText }}</el-button>
    </div>
  </div>
</template>

<script setup>
import NoPermission from "@/assets/403.svg";
import PageError from "@/assets/404.svg";
import NetworkError from "@/assets/500.svg";

const errorMap = {
  404: {
    errorImage: PageError,
    title: "页面丢失",
    errorMessage: "抱歉, 您访问的页面不存在!",
  },
  500: {
    errorImage: NetworkError,
    title: "出现错误",
    errorMessage: "抱歉, 服务器出现错误!",
  },
  403: {
    errorImage: NoPermission,
    title: "没有权限",
    errorMessage: "抱歉, 您没有权限访问此页面!",
  },
};

defineProps({
  type: {
    type: String,
    validator(v) {
      return ["403", "404", "500"].includes(v);
    },
    default: "404",
  },
  buttonText: {
    type: String,
    default: "返回",
  },
});
const emits = defineEmits(["errorOperation"]);

const handleClick = () => {
  emits("errorOperation");
};
</script>
