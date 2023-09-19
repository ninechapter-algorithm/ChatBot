import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { store } from "..";
import { ss } from "../../utils/storage";
import { fetchSession } from "../../api";

const LOCAL_NAME = "CHATBOT_TOKEN";

export const useAuthStore = defineStore("authStore", () => {
  const token = ref(ss.get(LOCAL_NAME) ?? "");
  const session = ref({});

  const isChatGPTAPI = computed(() => {
    // return session.value?.model === "ChatGPTAPI";
    return true;
  });

  const getSession = async () => {
    try {
      const { data } = await fetchSession();
      session.value = { ...data };

      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const setToken = (val) => {
    token.value = val;
    ss.set(LOCAL_NAME, val);
  };

  const removeToken = () => {
    token.value = "";
    ss.remove(LOCAL_NAME);
  };

  return {
    token,
    session,
    isChatGPTAPI,
    getSession,
    setToken,
    removeToken,
  };
});

export const useAuthStoreWithOut = () => {
  return useAuthStore(store);
};
