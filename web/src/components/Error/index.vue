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
import { t } from "../../locales";

const errorMap = {
  404: {
    errorImage: PageError,
    title: t("error.title404"),
    errorMessage: t("error.message404"),
  },
  500: {
    errorImage: NetworkError,
    title: t("error.title500"),
    errorMessage: t("error.message500"),
  },
  403: {
    errorImage: NoPermission,
    title: t("error.title403"),
    errorMessage: t("error.message403"),
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
    default: t("common.back"),
  },
});
const emits = defineEmits(["errorOperation"]);

const handleClick = () => {
  emits("errorOperation");
};
</script>
