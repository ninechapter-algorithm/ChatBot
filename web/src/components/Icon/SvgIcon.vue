<template>
  <Icon :icon="name" v-bind="bindAttrs" />
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { computed, useAttrs } from "vue";

defineProps({
  name: {
    type: String,
    required: true,
  },
});

// 获取组件的属性对象
const attrs = useAttrs();

// 创建计算属性
const bindAttrs = computed(() => ({
  // 绑定class属性 如果没有则返回空字符串
  class: attrs.class || "",
  // 绑定style属性 如果没有则返回空字符串
  style: attrs.style || "",
}));
</script>
