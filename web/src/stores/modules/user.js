import { ref } from "vue";
import { defineStore } from "pinia";
import { ss } from "../../utils/storage";

const LOCAL_NAME = "user-store";

export const useUserStore = defineStore("userStore", () => {
  const nickname = ref("LintCode");
  const avatarUrl = ref(
    "https://media-lc.lintcode.com/u_501764/202309/ce245a18d894424dbeb864d0e3d016b1/lintcode.ico",
  );
  const description = ref(
    'Learn this at <a href="https://www.lintcode.com/course/110" class="text-blue-500" target="_blank">LintCode</a>',
  );

  // 从LocalStorage获取状态值
  (() => {
    const localStates = ss.get(LOCAL_NAME);
    if (localStates) {
      nickname.value = localStates?.nickname ?? nickname.value;
      avatarUrl.value = localStates?.avatarUrl ?? avatarUrl.value;
      description.value = localStates?.description ?? description.value;
    }
  })();

  const updateUserInfo = (userInfo) => {
    nickname.value = userInfo?.nickname ?? nickname.value;
    avatarUrl.value = userInfo?.avatarUrl ?? avatarUrl.value;
    description.value = userInfo?.description ?? description.value;
    storeLocalStates();

    return true;
  };

  const storeLocalStates = () => {
    ss.set(LOCAL_NAME, {
      nickname: nickname.value,
      avatarUrl: avatarUrl.value,
      description: description.value,
    });
  };

  return {
    nickname,
    avatarUrl,
    description,
    updateUserInfo,
    storeLocalStates,
  };
});
