<template>
  <div class="p-4 space-y-5 min-h-[300px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[80px]">{{ t("setting.name") }}</span>
        <div class="flex-1">
          <el-input class="!w-[200px]" v-model="userInfo.nickname" />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[80px]">{{ t("setting.description") }}</span>
        <div class="flex-1">
          <el-input v-model="userInfo.description" />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[80px]">{{ t("setting.avatarLink") }}</span>
        <div class="flex-1 mr-2">
          <el-input v-model="userInfo.avatarUrl" />
        </div>
        <el-button size="small" type="primary" text @click="previewAvatar = true">{{
          t("common.preview")
        }}</el-button>
      </div>

      <div class="flex items-center space-x-4" :class="isMobile && 'items-start'">
        <span class="flex-shrink-0 w-[80px]">{{ t("setting.chatHistory") }}</span>
        <input id="fileInput" type="file" style="display: none" @change="handleImportChats" />
        <div class="flex flex-wrap items-center gap-4">
          <el-button type="primary" plain @click="handleExportChats">
            <template #icon>
              <SvgIcon name="ri:download-2-fill" class="text-[16px]" />
            </template>
            {{ t("common.export") }}
          </el-button>

          <el-button type="success" plain @click="handleClickImportButton">
            <template #icon>
              <SvgIcon name="ri:upload-2-fill" class="text-[16px]" />
            </template>
            {{ t("common.import") }}
          </el-button>

          <el-button type="info" plain @click="handleClearChats">
            <template #icon>
              <SvgIcon name="ri:delete-bin-5-fill" class="text-[16px]" />
            </template>
            {{ t("common.clear") }}
          </el-button>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[80px]">{{ t("setting.theme") }}</span>
        <div class="flex-1">
          <el-radio-group v-model="theme">
            <el-radio-button v-for="item in themeOptions" :key="item.label" :label="item.label">
              <el-tooltip :content="item.title" placement="bottom">
                <SvgIcon :name="item.icon" class="text-[16px]" />
              </el-tooltip>
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[80px]">{{ t("setting.language") }}</span>
        <div class="flex-1">
          <el-select v-model="language">
            <el-option
              v-for="item in localeOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </div>
      </div>

      <div class="flex items-center justify-end">
        <el-button type="primary" size="small" @click="handleUpdateUserInfo">{{
          t("common.save")
        }}</el-button>
      </div>
    </div>

    <el-image-viewer
      v-if="previewAvatar"
      :url-list="[avatarUrl]"
      :hide-on-click-modal="true"
      @close="previewAvatar = false"
    />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAppStore, useUserStore } from "../../stores";
import { getCurrentDate } from "../../utils";
import { useMobile } from "../../hooks/useMobile";
import { t } from "../../locales";

const SvgIcon = defineAsyncComponent(() => import("../Icon/SvgIcon.vue"));

// 主题选项
const themeOptions = [
  {
    label: false,
    title: "Light",
    icon: "ri:sun-foggy-line",
  },
  {
    label: true,
    title: "Dark",
    icon: "ri:moon-foggy-line",
  },
];

// 多语言选项
const localeOptions = [
  { label: "简体中文", key: "zh-CN", value: "zh-CN" },
  { label: "繁體中文", key: "zh-TW", value: "zh-TW" },
  { label: "English", key: "en-US", value: "en-US" },
  { label: "한국어", key: "ko-KR", value: "ko-KR" },
  { label: "Русский язык", key: "ru-RU", value: "ru-RU" },
];

const { isMobile } = useMobile();

// 使用useUserStore()函数获取用户存储实例
const userStore = useUserStore();
// 从userStore中解构出updateUserInfo方法
const { updateUserInfo } = userStore;
// 使用storeToRefs()函数将userStore转换为响应式引用
const { nickname, description, avatarUrl } = storeToRefs(userStore);

// 创建一个ref对象userInfo 包含用户信息的昵称、描述和头像链接
const userInfo = ref({
  nickname: nickname.value ?? "",
  description: description.value ?? "",
  avatarUrl: avatarUrl.value ?? "",
});

// 是否对头像图片进行预览
const previewAvatar = ref(false);

// 使用useAppStore()函数获取应用程序存储实例
const appStore = useAppStore();
// 从appStore中解构出setIsDark和setLocale方法
const { setIsDark, setLocale } = appStore;
// 使用storeToRefs()函数将appStore转换为响应式引用
const { isDark, locale } = storeToRefs(appStore);

// 创建一个computed属性theme 用于获取和设置是否使用深色主题
const theme = computed({
  get() {
    return isDark.value;
  },
  set(value) {
    setIsDark(value);
  },
});
// 创建一个computed属性language 用于获取和设置应用程序的语言
const language = computed({
  get() {
    return locale.value;
  },
  set(value) {
    setLocale(value);
  },
});

// 导出对话记录为json文件
const handleExportChats = () => {
  // 获取当前日期
  const date = getCurrentDate();
  // 从本地存储中获取对话记录，如果不存在则使用空对象
  const chats = localStorage.getItem("chat-store") || "{}";
  // 将对话记录对象转换为格式化的JSON字符串
  const jsonString = JSON.stringify(JSON.parse(chats), null, 2);
  // 创建Blob对象，用于存储JSON字符串
  const blob = new Blob([jsonString], { type: "application/json" });
  // 创建URL，用于下载JSON文件
  const url = URL.createObjectURL(blob);
  // 创建<a>元素
  const link = document.createElement("a");
  // 设置<a>元素的href属性为URL
  link.href = url;
  // 设置<a>元素的download属性为下载文件的名称
  link.download = `chat-store_${date}.json`;
  // 将<a>元素添加到页面中
  document.body.appendChild(link);
  // 模拟点击<a>元素，触发下载
  link.click();
  // 将<a>元素从页面中移除
  document.body.removeChild(link);
};

// 从json文件导入对话记录
const handleImportChats = (event) => {
  // 获取事件的目标元素
  const target = event.target;
  if (!target || !target.files) {
    return;
  }

  // 获取选择的文件
  const file = target.files[0];
  if (!file) {
    return;
  }

  // 创建FileReader对象，用于读取文件内容
  const reader = new FileReader();
  reader.onload = () => {
    try {
      // 解析文件内容为JSON对象
      const data = JSON.parse(reader.result);
      // 将解析的JSON对象存储到本地存储中
      localStorage.setItem("chat-store", JSON.stringify(data));
      // 显示成功的消息提示
      ElMessage.success(t("common.importSuccess"));
      // 刷新页面
      location.reload();
    } catch (error) {
      // 显示错误的消息提示
      ElMessage.error(t("common.wrong"));
    }
  };
  // 以文本形式读取文件内容
  reader.readAsText(file);
};

// 清空对话记录
const handleClearChats = () => {
  ElMessageBox.confirm(t("chat.clearChatConfirm"), t("chat.clearChat"), {
    confirmButtonText: t("common.yes"),
    cancelButtonText: t("common.no"),
    type: "warning",
  })
    .then(() => {
      // 从本地存储中移除对话记录
      localStorage.removeItem("chat-store");
      // 显示成功的消息提示
      ElMessage.success(t("common.success"));
      // 刷新页面
      location.reload();
    })
    .catch(() => {
      // 显示取消的消息提示
      ElMessage.info(t("common.canceled"));
    });
};

// 点击导入按钮处理事件
const handleClickImportButton = () => {
  // 获取文件输入框元素
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    // 触发文件输入框的点击事件
    fileInput.click();
  }
};

const handleUpdateUserInfo = async () => {
  const result = await updateUserInfo(userInfo.value);
  if (result) {
    ElMessage.success(t("common.success"));
    window.location.reload();
  } else {
    ElMessage.error(t("common.failed"));
  }
};
</script>

<style lang="less" scoped>
.el-button {
  margin-left: 0 !important;
}
</style>
