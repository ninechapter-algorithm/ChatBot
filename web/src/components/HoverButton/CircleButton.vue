<template>
  <button
    class="flex items-center justify-center w-10 h-10 transition rounded-full hover:bg-neutral-100 dark:hover:bg-[#414755]"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup>
const eimts = defineEmits(["click"]);

const handleClick = () => {
  eimts("click");
};
</script>
