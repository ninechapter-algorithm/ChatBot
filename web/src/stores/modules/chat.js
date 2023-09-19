import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { router } from "@/router";
import { ss } from "@/utils/storage";

const LOCAL_NAME = "chat-store";

export const useChatStore = defineStore("chatStore", () => {
  const uuid = ref(1000);
  const active = ref(uuid.value);
  const usingContext = ref(true);
  const history = ref([{ uuid: uuid.value, title: "New Chat", isEdit: false }]);
  const chat = ref([{ uuid: uuid.value, data: [] }]);

  // 从LocalStorage获取状态值
  (() => {
    const localStates = ss.get(LOCAL_NAME);
    if (localStates) {
      uuid.value = localStates.uuid ?? uuid.value;
      active.value = localStates.active ?? active.value;
      usingContext.value = localStates.usingContext ?? usingContext.value;
      history.value = localStates.history ?? history.value;
      chat.value = localStates.chat ?? chat.value;
    }
  })();

  const getChatHistoryByCurrentActive = computed(() => {
    const index = history.value.findIndex((item) => item.uuid === active.value);
    if (index !== -1) {
      return history.value[index];
    }

    return null;
  });

  const getChatByUuid = computed(() => {
    return (uid) => {
      if (uid) {
        chat.value.find((obj) => obj.uuid === uid);
        return chat.value.find((item) => item.uuid === uid)?.data ?? [];
      }

      return chat.value.find((item) => item.uuid === active.value)?.data ?? [];
    };
  });

  const storeLocalStates = () => {
    ss.set(LOCAL_NAME, {
      uuid: uuid.value,
      active: active.value,
      usingContext: usingContext.value,
      history: history.value,
      chat: chat.value,
    });
  };

  const setUsingContext = (context) => {
    usingContext.value = context;
    storeLocalStates();
  };

  const addHistory = (record, chatData = []) => {
    history.value.unshift(record);
    chat.value.unshift({ uuid: record.uuid, data: chatData });
    active.value = record.uuid;
    reloadRoute(record.uuid);
  };

  const updateHistory = (uid, edit) => {
    const index = history.value.findIndex((item) => item.uuid === uid);
    if (index !== -1) {
      history.value[index] = { ...history.value[index], ...edit };
      storeLocalStates();
    }
  };

  const deleteHistory = async (index) => {
    history.value.splice(index, 1);
    chat.value.splice(index, 1);

    if (history.value.length === 0) {
      active.value = null;
      reloadRoute();
      return;
    }

    if (index > 0 && index <= history.value.length) {
      const uid = history.value[index - 1].uuid;
      active.value = uid;
      reloadRoute(uid);
      return;
    }

    if (index === 0) {
      if (history.value.length > 0) {
        const uid = history.value[0].uuid;
        active.value = uid;
        reloadRoute(uid);
      }
    }

    if (index > history.value.length) {
      const uid = history.value[history.value.length - 1].uuid;
      active.value = uid;
      reloadRoute(uid);
    }
  };

  const setActive = async (uid) => {
    active.value = uid;
    return await reloadRoute(uid);
  };

  const getChatByUuidAndIndex = (uid, index) => {
    if (!uid || uid === 0) {
      if (chat.value.length) {
        return chat.value[0].data[index];
      }

      return null;
    }

    const chatIndex = chat.value.findIndex((item) => item.uuid === uid);
    if (chatIndex !== -1) {
      return chat.value[chatIndex].data[index];
    }

    return null;
  };

  const addChatByUuid = (uid, source) => {
    if (!uid || uid === 0) {
      if (history.value.length === 0) {
        const uid = Date.now();
        history.value.push({ uuid: uid, title: source.text, isEdit: false });
        chat.value.push({ uuid: uid, data: [source] });
        active.value = uid;
        storeLocalStates();
      } else {
        chat.value[0].data.push(source);
        if (history.value[0].title === "New Chat") {
          history.value[0].title = source.text;
        }

        storeLocalStates();
      }
    }

    const index = chat.value.findIndex((item) => item.uuid === uid);
    if (index !== -1) {
      chat.value[index].data.push(source);
      if (history.value[index].title === "New Chat") {
        history.value[index].title = source.text;
      }

      storeLocalStates();
    }
  };

  const updateChatByUuid = (uid, index, source) => {
    if (!uid || uid === 0) {
      if (chat.value.length) {
        chat.value[0].data[index] = source;
        storeLocalStates();
      }
      return;
    }

    const chatIndex = chat.value.findIndex((item) => item.uuid === uid);
    if (chatIndex !== -1) {
      chat.value[chatIndex].data[index] = source;
      storeLocalStates();
    }
  };

  const updateChatSomeByUuid = (uid, index, source) => {
    if (!uid || uid === 0) {
      if (chat.value.length) {
        chat.value[0].data[index] = { ...chat.value[0].data[index], ...source };
        storeLocalStates();
      }
      return;
    }

    const chatIndex = chat.value.findIndex((item) => item.uuid === uid);
    if (chatIndex !== -1) {
      chat.value[chatIndex].data[index] = { ...chat.value[chatIndex].data[index], ...source };
      storeLocalStates();
    }
  };

  const deleteChatByUuid = (uid, index) => {
    if (!uid || uid === 0) {
      if (chat.value.length) {
        chat.value[0].data.splice(index, 1);
        storeLocalStates();
      }
      return;
    }

    const chatIndex = chat.value.findIndex((item) => item.uuid === uid);
    if (chatIndex !== -1) {
      chat.value[chatIndex].data.splice(index, 1);
      storeLocalStates();
    }
  };

  const clearChatByUuid = (uid) => {
    if (!uid || uid === 0) {
      if (chat.value.length) {
        chat.value[0].data = [];
        storeLocalStates();
      }
      return;
    }

    const index = chat.value.findIndex((item) => item.uuid === uid);
    if (index !== -1) {
      chat.value[index].data = [];
      storeLocalStates();
    }
  };

  const reloadRoute = async (uid) => {
    storeLocalStates();
    await router.push({ name: "Chat", params: { uuid: uid } });
  };

  return {
    uuid,
    active,
    usingContext,
    history,
    chat,
    getChatHistoryByCurrentActive,
    getChatByUuid,
    storeLocalStates,
    setUsingContext,
    addHistory,
    updateHistory,
    deleteHistory,
    setActive,
    getChatByUuidAndIndex,
    addChatByUuid,
    updateChatByUuid,
    updateChatSomeByUuid,
    deleteChatByUuid,
    clearChatByUuid,
    reloadRoute,
  };
});
