<template>
  <el-dialog v-model="show" width="640px" align-center>
    <el-tabs v-model="active">
      <el-tab-pane name="General">
        <template #label>
          <div class="flex items-center">
            <SvgIcon name="ri:file-user-line" class="text-lg" />
            <span class="ml-2">{{ t("setting.general") }}</span>
          </div>
        </template>
        <div class="min-h-[100px]">
          <General />
        </div>
      </el-tab-pane>

      <el-tab-pane name="Advanced">
        <template #label>
          <div class="flex items-center">
            <SvgIcon name="ri:equalizer-line" class="text-lg" />
            <span class="ml-2">{{ t("setting.advanced") }}</span>
          </div>
        </template>
        <div class="min-h-[100px]">
          <Advanced />
        </div>
      </el-tab-pane>

      <el-tab-pane name="About">
        <template #label>
          <div class="flex items-center">
            <SvgIcon name="ri:list-settings-line" class="text-lg" />
            <span class="ml-2">{{ t("setting.config") }}</span>
          </div>
        </template>
        <div class="min-h-[100px]">
          <About />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from "vue";
import { t } from "../../locales";

const SvgIcon = defineAsyncComponent(() => import("@/components/Icon/SvgIcon.vue"));
const General = defineAsyncComponent(() => import("./General.vue"));
const Advanced = defineAsyncComponent(() => import("./Advanced.vue"));
const About = defineAsyncComponent(() => import("./About.vue"));

// 定义所需属性
const props = defineProps({
  // 可见状态 true/false
  visible: {
    type: Boolean,
  },
});

// 定义传递的事件
// update:visible -> 用于更新visible的值
const emits = defineEmits(["update:visible"]);

// 定义计算属性show
const show = computed({
  get() {
    // 从props.visible中获取值
    return props.visible;
  },
  set(visible) {
    // 发生变更时触发update:visible事件
    emits("update:visible", visible);
  },
});

const active = ref("General");
</script>
