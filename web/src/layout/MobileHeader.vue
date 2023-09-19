<template>
  <header
    class="sticky top-0 left-0 right-0 z-30 border-b dark:border-neutral-800 bg-white/80 dark:bg-black/20 backdrop-blur"
  >
    <div class="relative flex items-center justify-between min-w-0 overflow-hidden h-14">
      <div class="flex items-center">
        <button class="flex items-center justify-center w-11 h-11" @click="handleUpdateCollapsed">
          <SvgIcon v-if="siderCollapsed" class="text-2xl" name="ri:align-justify" />
          <SvgIcon v-else class="text-2xl" name="ri:align-right" />
        </button>
      </div>
      <h1
        class="flex-1 px-4 pr-6 overflow-hidden cursor-pointer select-none text-ellipsis whitespace-nowrap"
        @dblclick="onScrollToTop"
      >
        {{ currentChatHistory?.title ?? "" }}
      </h1>
      <div class="flex items-center space-x-2">
        <HoverButton @click="toggleUsingContext">
          <span
            class="text-xl"
            :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }"
          >
            <SvgIcon name="ri:chat-history-line" />
          </span>
        </HoverButton>
        <HoverButton @click="handleExport">
          <span class="text-xl text-[#4f555e] dark:text-white">
            <SvgIcon name="ri:download-2-line" />
          </span>
        </HoverButton>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick } from "vue";
import { useAppStore, useChatStore } from "../stores";
import { storeToRefs } from "pinia";

const SvgIcon = defineAsyncComponent(() => import("../components/Icon/SvgIcon.vue"));
const HoverButton = defineAsyncComponent(() => import("../components/HoverButton/index.vue"));

defineProps({
  usingContext: {
    type: Boolean,
  },
});

const emit = defineEmits(["export", "toggleUsingContext"]);

const appStore = useAppStore();
const { siderCollapsed } = storeToRefs(appStore);
const chatStore = useChatStore();

const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive);

const handleUpdateCollapsed = () => {
  siderCollapsed.value = !siderCollapsed.value;
};

const onScrollToTop = () => {
  const scrollRef = document.querySelector("#scrollRef");
  if (scrollRef) {
    nextTick(() => (scrollRef.scrollTop = 0));
  }
};

const handleExport = () => {
  emit("export");
};

const toggleUsingContext = () => {
  emit("toggleUsingContext");
};
</script>
