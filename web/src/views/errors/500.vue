<template>
  <Error type="500" @error-operation="handleErrorClick" />
</template>

<script setup>
import { defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";

const Error = defineAsyncComponent(() => import("@/components/Error/index.vue"));

const { push } = useRouter();

const handleErrorClick = () => {
  push("/");
};
</script>
