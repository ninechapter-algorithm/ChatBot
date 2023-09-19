<template>
  <div
    ref="messageRef"
    class="flex w-full mb-6 overflow-hidden"
    :class="[{ 'flex-row-reverse': inversion }]"
  >
    <!-- Avatar -->
    <div class="!w-[28px]" :class="[inversion ? 'ml-2' : 'mr-2']">
      <el-avatar :size="28" :src="inversion ? userAvatar : gptAvatar" />
    </div>

    <!-- Text -->
    <div class="overflow-hidden text-sm" :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dateTime }}
      </p>
      <div class="flex items-end gap-1 mt-2" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
        <!-- TextComponent -->
        <Text
          ref="textRef"
          :inversion="inversion"
          :text="text"
          :as-raw-text="showAsRawText"
          :error="error"
          :loading="loading"
        />
        <div class="flex flex-col">
          <button
            v-if="!inversion"
            class="mb-2 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleRegenerate"
          >
            <SvgIcon name="ri:restart-line" />
          </button>

          <el-dropdown trigger="click" :placement="inversion ? 'left' : 'right'">
            <button
              class="transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              <SvgIcon name="ri:more-2-fill" />
            </button>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="item in options" :key="item.key">
                  <div class="flex items-center" @click="item.operation">
                    <SvgIcon :name="item.icon" />
                    <span class="ml-1">{{ item.title }}</span>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { useUserStore } from "../../stores";
import { copyToClip } from "../../utils/copy";
import { t } from "../../locales";

const props = defineProps({
  inversion: {
    type: Boolean,
    required: true,
  },
  text: {
    type: String,
    default: "",
  },
  error: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
  },
  dateTime: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["delete", "regenerate"]);

const SvgIcon = defineAsyncComponent(() => import("../Icon/SvgIcon.vue"));
const Text = defineAsyncComponent(() => import("./Text.vue"));

const userStore = useUserStore();
const { avatarUrl } = storeToRefs(userStore);

const gptAvatar =
  "https://media-lc.lintcode.com/u_501764/202309/2c037c932df448529393b2cf2fe017db/chatgpt.svg";

const userAvatar = computed(() => {
  return (
    avatarUrl.value ??
    "https://media-lc.lintcode.com/u_501764/202309/ce245a18d894424dbeb864d0e3d016b1/lintcode.ico"
  );
});

const messageRef = ref();
const textRef = ref();

const showAsRawText = ref(props.inversion);
const options = computed(() => {
  const items = [
    {
      key: "copy",
      title: t("chat.copy"),
      icon: "ri:file-copy-2-line",
      operation: () => {
        handleCopy();
      },
    },
    {
      key: "delete",
      title: t("common.delete"),
      icon: "ri:delete-bin-line",
      operation: () => {
        handleDelete();
      },
    },
  ];

  if (!props.inversion) {
    items.unshift({
      key: "rawText",
      title: showAsRawText.value ? t("chat.preview") : t("chat.showRawText"),
      icon: showAsRawText.value ? "ic:outline-code-off" : "ic:outline-code",
      operation: () => {
        toggleRenderType();
      },
    });
  }

  return items;
});

/**
 * 重新生成
 * @returns {void}
 */
const handleRegenerate = () => {
  // 尝试将messageRef的值滚动到可视区域，以确保新生成的内容可见
  messageRef.value?.scrollIntoView();
  // 触发"regenerate"事件
  emits("regenerate");
};

/**
 * 删除消息内容
 * @returns {void}
 */
const handleDelete = () => {
  // 触发"delete"事件
  emits("delete");
};

/**
 * 复制文本到剪贴板
 * @returns {Promise<void>}
 */
const handleCopy = async () => {
  try {
    // 尝试调用copyToClip函数将文本复制到剪贴板
    await copyToClip(props.text || "");
    // 显示成功提示消息
    ElMessage.success(t("common.success"));
  } catch {
    // 复制失败
    // 显示错误提示消息
    ElMessage.error(t("common.failed"));
  }
};

/**
 * 切换渲染类型
 * 将showAsRawText的值取反，从而切换渲染类型。
 * @returns {void}
 */
const toggleRenderType = () => {
  showAsRawText.value = !showAsRawText.value;
};
</script>
