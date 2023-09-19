<template>
  <div class="h-full dark:bg-[#24272e] transition-all p-4">
    <!-- 框架容器 -->
    <div class="h-full overflow-hidden" :class="getMobileClass">
      <el-container class="h-full relative z-40 transition">
        <!-- 侧边栏容器 -->
        <Sider />
        <!-- 折叠侧边栏按钮 -->
        <div v-show="!isMobile" :class="getCollapseBtnClass">
          <el-button class="!text-lg" size="small" circle @click="handleToggleCollapsed">
            <SvgIcon
              :name="siderCollapsed ? 'mingcute:right-fill' : 'mingcute:left-fill'"
              class="!text-lg"
            />
          </el-button>
        </div>
        <!-- 主区域容器 -->
        <el-main class="h-full !p-0 dark:bg-[#101014]">
          <router-view v-slot="{ Component, route }">
            <component :is="Component" :key="route.fullPath" />
          </router-view>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores";
import { useMobile } from "../hooks/useMobile";

const SvgIcon = defineAsyncComponent(() => import("../components/Icon/SvgIcon.vue"));
const Sider = defineAsyncComponent(() => import("./sider/index.vue"));

const { isMobile } = useMobile();

const appStore = useAppStore();
const { siderCollapsed } = storeToRefs(appStore);

const getMobileClass = computed(() => {
  if (isMobile.value) {
    return ["rounded-none", "shadow-none"];
  }

  return ["border", "rounded-md", "shadow-md", "dark:border-neutral-800"];
});

const getCollapseBtnClass = computed(() => {
  return ["absolute", "top-1/2", siderCollapsed.value ? "left-[-10px]" : "left-[248px]"];
});

const handleToggleCollapsed = () => {
  siderCollapsed.value = !siderCollapsed.value;
};
</script>
