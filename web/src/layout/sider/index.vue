<template>
  <el-aside
    :width="siderCollapsed ? '0' : '260px'"
    class="bg-[--el-bg-color] border-r-[1px] border-solid border-[#efeff5] dark:border-neutral-800"
    :class="getMobileClass"
  >
    <!-- 侧边栏容器 -->
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <!-- 对话列表 -->
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4">
          <el-button plain class="!border-dashed w-full" @click="handleAddChat">{{
            t("chat.newChatButton")
          }}</el-button>
        </div>

        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <ChatList />
        </div>
      </main>
      <!-- 底部组件 -->
      <footer
        class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800"
      >
        <!-- 用户信息组件 -->
        <div class="flex-1 flex-shrink-0 overflow-hidden">
          <div class="flex items-center overflow-hidden">
            <div class="w-10 h-10 overflow-hidden rounded-full shrink-0">
              <el-avatar :size="40" :src="avatarUrl" />
            </div>
            <div class="flex-1 min-w-0 ml-2">
              <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
                {{ nickname ?? "LintCode" }}
              </h2>
              <p class="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap">
                <span
                  v-if="isString(description) && description !== ''"
                  v-html="description"
                ></span>
              </p>
            </div>
          </div>
        </div>
        <!-- 设置组件 -->
        <HoverButton content="设置" placement="right" @click="showSetting = true">
          <span class="text-xl text-[#4f555e] dark:text-white">
            <SvgIcon name="ri:settings-4-line" />
          </span>
        </HoverButton>
        <Setting v-model:visible="showSetting" />
      </footer>
    </div>
  </el-aside>
  <template v-if="isMobile">
    <div
      v-show="!siderCollapsed"
      class="fixed inset-0 z-40 w-full h-full bg-black/40"
      @click="siderCollapsed = !siderCollapsed"
    ></div>
  </template>
</template>

<script setup>
import { computed, defineAsyncComponent, watch, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore, useUserStore, useChatStore } from "../../stores";
import { useMobile } from "../../hooks/useMobile";
import { isString } from "../../utils";
import { t } from "../../locales";

const ChatList = defineAsyncComponent(() => import("./ChatList.vue"));
const HoverButton = defineAsyncComponent(() => import("../../components/HoverButton/index.vue"));
const Setting = defineAsyncComponent(() => import("../../components/Setting/index.vue"));
const SvgIcon = defineAsyncComponent(() => import("../../components/Icon/SvgIcon.vue"));

const { isMobile } = useMobile();

const appStore = useAppStore();
const { setSiderCollapsed } = appStore;
const { siderCollapsed } = storeToRefs(appStore);

const userStore = useUserStore();
const { nickname, avatarUrl, description } = storeToRefs(userStore);

const chatStore = useChatStore();
const { addHistory } = chatStore;

const showSetting = ref(false);

const getMobileClass = computed(() => {
  if (isMobile.value) {
    return ["fixed", "inset-y-0", "left-0", "z-50"];
  }

  return [];
});

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return { paddingBottom: "env(safe-area-inset-bottom)" };
  }

  return {};
});

// 添加新的对话
const handleAddChat = () => {
  // 调用addHistory方法，向对话存储中添加一条新的聊天记录
  addHistory({ title: "New Chat", uuid: Date.now(), isEdit: false });
  // 如果是移动设备
  if (isMobile.value) {
    setSiderCollapsed(true); // 调用setSiderCollapsed方法，将侧边栏折叠起来
  }
};

watch(
  isMobile,
  (val) => {
    setSiderCollapsed(val);
  },
  { immediate: true, flush: "post" },
);
</script>
