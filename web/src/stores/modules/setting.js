import { ref } from "vue";
import { defineStore } from "pinia";
import { ss } from "../../utils/storage";

const LOCAL_NAME = "setting-store";

export const useSettingStore = defineStore("settingStore", () => {
  const systemMessage = ref(
    "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
  );
  const temperature = ref(0.8);
  const topP = ref(1);

  // 从LocalStorage获取状态值
  (() => {
    const localStates = ss.get(LOCAL_NAME);
    systemMessage.value = localStates.systemMessage ?? systemMessage.value;
    temperature.value = localStates.temperature ?? temperature.value;
    topP.value = localStates.topP ?? topP.value;
  })();

  const removeLocalStates = () => {
    ss.remove(LOCAL_NAME);
  };

  const storeLocalStates = () => {
    ss.set(LOCAL_NAME, {
      systemMessage: systemMessage.value,
      temperature: temperature.value,
      topP: topP.value,
    });
  };

  const updateSettings = (settings) => {
    systemMessage.value = settings?.systemMessage ?? systemMessage.value;
    temperature.value = settings?.temperature ?? temperature.value;
    topP.value = settings?.topP ?? topP.value;
    storeLocalStates();
  };

  const resetSettings = () => {
    systemMessage.value =
      "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";
    temperature.value = 0.8;
    topP.value = 1;
    removeLocalStates();
  };

  return {
    systemMessage,
    temperature,
    topP,
    removeLocalStates,
    storeLocalStates,
    updateSettings,
    resetSettings,
  };
});
