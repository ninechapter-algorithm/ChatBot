<template>
  <div v-if="showTootip">
    <el-tooltip :content="content" :placement="placement">
      <CircleButton @click="handleClick">
        <slot></slot>
      </CircleButton>
    </el-tooltip>
  </div>
  <div v-else>
    <CircleButton @click="handleClick">
      <slot></slot>
    </CircleButton>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from "vue";

const CircleButton = defineAsyncComponent(() => import("./CircleButton.vue"));

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  placement: {
    type: String,
    default: "bottom",
  },
});

const emits = defineEmits(["click"]);

const showTootip = computed(() => Boolean(props.content));

const handleClick = () => {
  emits("click");
};
</script>
