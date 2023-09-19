import { ref } from "vue";
import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", () => {
  const nickname = ref("LintCode");
  const avatarUrl = ref(
    "https://media-lc.lintcode.com/u_501764/202309/ce245a18d894424dbeb864d0e3d016b1/lintcode.ico",
  );
  const description = ref(
    'Learn this at <a href="https://www.lintcode.com/course/110" class="text-blue-500" target="_blank">LintCode</a>',
  );

  const updateUserInfo = (userInfo) => {
    nickname.value = userInfo?.nickname ?? nickname.value;
    avatarUrl.value = userInfo?.avatarUrl ?? avatarUrl.value;
    description.value = userInfo?.description ?? description.value;

    return true;
  };

  return {
    nickname,
    avatarUrl,
    description,
    updateUserInfo,
  };
});
