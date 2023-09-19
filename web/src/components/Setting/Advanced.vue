<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ t("setting.role") }}</span>
        <div class="flex-1">
          <el-input
            v-model="settings.systemMessage"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
          />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ t("setting.temperature") }}</span>
        <div class="flex-1">
          <el-slider v-model="settings.temperature" :max="1" :min="0" :step="0.1" show-stops />
        </div>
        <span>{{ settings.temperature }}</span>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ t("setting.top_p") }}</span>
        <div class="flex-1">
          <el-slider v-model="settings.topP" :max="1" :min="0" :step="0.1" show-stops />
        </div>
        <span>{{ settings.topP }}</span>
      </div>

      <div class="flex items-center justify-end space-x-4">
        <el-button type="info" size="small" @click="handleResetSettings">{{ t("common.reset") }}</el-button>
        <el-button type="primary" size="small" @click="handleUpdateSettings">{{ t("common.save") }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入所需的 Vue 相关模块
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useSettingStore } from "../../stores";
import { ElMessage } from "element-plus";
import { t } from "../../locales";

// 使用设置存储
const settingStore = useSettingStore();
const { updateSettings, resetSettings } = settingStore;

// 将 store 中的响应式数据转化为普通引用类型的数据
const { systemMessage, temperature, topP } = storeToRefs(settingStore);

// 创建一个 ref 对象，用于存储设置数据
const settings = ref({
  systemMessage: systemMessage.value ?? "",
  temperature: temperature.value ?? 0.5,
  topP: topP.value ?? 1,
});

// 更新设置数据的处理函数
const handleUpdateSettings = async () => {
  // 调用更新设置的方法，并获取返回结果
  const result = await updateSettings(settings.value);
  if (result) {
    // 更新成功时显示成功消息并刷新页面
    ElMessage.success(t("common.success"));
    window.location.reload();
  } else {
    // 更新失败时显示错误消息
    ElMessage.error(t("common.failed"));
  }
};

// 重置设置的处理函数
const handleResetSettings = () => {
  // 调用重置设置的方法
  resetSettings();
  // 显示重置成功消息并刷新页面
  ElMessage.success(t("common.success"));
  window.location.reload();
};
</script>
