<template>
  <div class="flex flex-col w-full h-full">
    <!-- 头部组件(移动端) -->
    <MobileHeader
      v-if="isMobile"
      :using-context="usingContext"
      @export="handleExport"
      @toggle-using-context="toggleUsingContext"
    />
    <!-- 对话消息区域 -->
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div id="image-wrapper" class="w-full max-w-screen-xl m-auto dark:bg-[#101014] p-4">
          <template v-if="!chatSources.length">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <SvgIcon name="ri:bubble-chart-fill" class="mr-2 text-3xl" />
              <span>{{ t("chat.start") }}</span>
            </div>
          </template>

          <template v-else>
            <div>
              <Message
                v-for="(item, index) of chatSources"
                :key="index"
                :date-time="item.dateTime"
                :text="item.text"
                :inversion="item.inversion"
                :error="item.error"
                :loading="item.loading"
                @delete="handleDelete(index)"
                @regenerate="handleRegenerate(index)"
              />

              <!-- 停止响应按钮 -->
              <div class="sticky bottom-0 left-0 flex justify-center">
                <el-button v-if="isResponding" type="danger" plain @click="handleStop">
                  <template #icon>
                    <SvgIcon name="ri:stop-circle-line" />
                  </template>
                  {{ t("chat.stop") }}
                </el-button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
    <!-- 输入内容区域 -->
    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="flex items-center justify-between space-x-2">
          <HoverButton content="清空对话" placement="top" @click="handleClear">
            <SvgIcon name="ri:delete-bin-line" class="text-xl text-[#4f555e] dark:text-white" />
          </HoverButton>
          <HoverButton v-if="!isMobile" content="导出对话" placement="top" @click="handleExport">
            <SvgIcon name="ri:download-2-line" class="text-xl text-[#4f555e] dark:text-white" />
          </HoverButton>
          <HoverButton
            v-if="!isMobile"
            :content="usingContext ? '关闭记忆功能' : '开启记忆功能'"
            placement="top"
            @click="toggleUsingContext"
          >
            <SvgIcon
              name="ri:chat-history-line"
              class="text-xl"
              :class="[usingContext ? 'text-[#4b9e5f]' : 'text-[#a8071a]']"
            />
          </HoverButton>

          <el-input
            ref="inputRef"
            v-model="prompt"
            type="textarea"
            :placeholder="placeholder"
            :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
            @keypress="handleEnter"
          />

          <el-button type="primary" :disabled="isSendDisabled" @click="handleSubmit">
            <template #icon>
              <SvgIcon name="ri:send-plane-fill" class="dark:text-black" />
            </template>
          </el-button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useChatStore } from "../../stores";
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from "vue";
import { useUsingContext } from "../../hooks/useUsingContext";
import { useScroll } from "../../hooks/useScroll";
import { useMobile } from "../../hooks/useMobile";
import { fetchChatAPIProcess } from "../../api";
import { ElMessage, ElMessageBox } from "element-plus";
import html2canvas from "html2canvas";
import { t } from "../../locales";

const MobileHeader = defineAsyncComponent(() => import("../../layout/MobileHeader.vue"));
const SvgIcon = defineAsyncComponent(() => import("../../components/Icon/SvgIcon.vue"));
const Message = defineAsyncComponent(() => import("../../components/Message/index.vue"));
const HoverButton = defineAsyncComponent(() => import("../../components/HoverButton/index.vue"));

// 使用useRoute函数获取当前的路由信息
const route = useRoute();

// 从路由信息的params属性中解构出uuid参数
const { uuid } = route.params;

// 获取是否开启长回复
const enableLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === "true";

const chatStore = useChatStore();
const {
  getChatByUuid,
  addChatByUuid,
  updateChatByUuid,
  updateChatSomeByUuid,
  getChatByUuidAndIndex,
  deleteChatByUuid,
  clearChatByUuid,
} = chatStore;

const { isMobile } = useMobile();
const { usingContext, toggleUsingContext } = useUsingContext();
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll();

// 是否正在响应
const isResponding = ref(false);
// 输入框引用对象
const inputRef = ref(null);
// 用户输入的内容
const prompt = ref("");
// 输入框占位内容
const placeholder = computed(() => {
  if (isMobile.value) {
    return t("chat.placeholderMobile");
  }

  return t("chat.placeholder");
});

const chatSources = computed(() => {
  return getChatByUuid(+uuid);
});
const conversationList = computed(() =>
  chatSources.value.filter((chat) => !chat.inversion && !!chat.conversationOptions),
);

// 是否禁用发送按钮
const isSendDisabled = computed(() => {
  return isResponding.value || !prompt.value || prompt.value.trim() === "";
});

// 底部区域样式
const footerClass = computed(() => {
  let classes = ["p-4"];
  if (isMobile.value) {
    classes = ["sticky", "left-0", "bottom-0", "right-0", "p-2", "pr-3", "overflow-hidden"];
  }

  return classes;
});

let controller = new AbortController();

/**
 * 删除某条对话消息
 * @param {*} index 对话消息的索引
 */
const handleDelete = (index) => {
  if (isResponding.value) {
    // 如果正在响应 则直接返回 不进行删除
    return;
  }

  ElMessageBox.confirm(t("chat.deleteMessageConfirm"), t("chat.deleteMessage"), {
    confirmButtonText: t("common.yes"),
    cancelButtonText: t("common.no"),
    type: "warning",
  })
    .then(() => {
      // 执行删除对话消息
      deleteChatByUuid(+uuid, index);
    })
    .catch(() => {
      // 取消删除
      ElMessage.info(t("common.success"));
    });
};

const handleRegenerate = async (index) => {
  // 如果正在响应 则直接返回
  if (isResponding.value) {
    return;
  }

  controller = new AbortController();

  // 获取index对应的对话消息的请求选项
  const { requestOptions } = chatSources.value[index];

  // 从请求选项中获取输入的消息内容
  let message = requestOptions?.prompt ?? "";
  // 从请求选项中获取options内容
  let options = {};
  if (requestOptions.options) {
    options = { ...requestOptions.options };
  }

  // 设置响应状态为true
  isResponding.value = true;

  // 更新响应消息的内容 同样以空内容对话作为消息体
  updateChatByUuid(+uuid, index, {
    dateTime: new Date().toLocaleString(),
    text: "",
    inversion: false,
    error: false,
    loading: true,
    conversationOptions: null,
    requestOptions: { prompt: message, options: { ...options } },
  });

  try {
    // 上一个消息的内容
    let lastText = "";
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          // 获取响应文本
          const { responseText } = event.target;
          // 只对最后一行进行处理
          const lastIndex = responseText.lastIndexOf("\n", responseText.length - 2);
          let chunk = responseText;
          if (lastIndex !== -1) {
            chunk = responseText.substring(lastIndex);
          }

          try {
            const data = JSON.parse(chunk);
            // 更新响应消息的内容
            updateChatByUuid(+uuid, chatSources.value.length - 1, {
              dateTime: new Date().toLocaleString(),
              text: lastText + (data.text ?? ""),
              inversion: false,
              error: false,
              loading: true,
              conversationOptions: {
                conversationId: data.conversationId,
                parentMessageId: data.id,
              },
              requestOptions: { prompt: message, options: { ...options } },
            });

            // 如果开启长回复内容 并且响应停止的原因是"length"
            if (enableLongReply && data.details.choices[0].finish_reason === "length") {
              options.parentMessageId = data.id;
              lastText = data.text;
              message = "";
              return fetchChatAPIOnce();
            }
          } catch (error) {
            //
          }
        },
      });
      // 最后将uuid对应的对话消息体中的loading都更新为false
      updateChatSomeByUuid(+uuid, chatSources.value.length - 1, { loading: false });
    };

    await fetchChatAPIOnce();
  } catch (error) {
    // 获取错误信息
    const errorMessage = error?.message ?? t("common.wrong");

    // 如果错误原因是主动取消响应
    if (errorMessage === "canceled") {
      // 更新对话记录
      updateChatSomeByUuid(+uuid, chatSources.value.length - 1, { loading: false });
      return;
    }

    // 获取当前响应消息对象
    const currentChat = getChatByUuidAndIndex(+uuid, chatSources.value.length - 1);

    // 如果已经响应了部分内容
    if (currentChat?.text && currentChat.text !== "") {
      updateChatSomeByUuid(+uuid, chatSources.value.length - 1, {
        text: `${currentChat.text}\n[${errorMessage}]`,
        error: false,
        loading: false,
      });
      return;
    }

    // 如果还未响应就出现错误了 则将消息体的error设为true
    updateChatByUuid(+uuid, chatSources.value.length - 1, {
      dateTime: new Date().toLocaleString(),
      text: errorMessage,
      inversion: false,
      error: true,
      loading: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    });
  } finally {
    isResponding.value = false;
  }
};

const handleStop = () => {
  if (isResponding.value) {
    // 如果是正在响应 则可以进行停止的操作
    controller.abort();
    isResponding.value = false;
  }
};

/**
 * 清空当前对话列表所有消息
 */
const handleClear = () => {
  if (isResponding.value) {
    // 如果正在响应 则不进行情况操作 直接返回
    return;
  }

  ElMessageBox.confirm(t("chat.clearChatConfirm"), t("chat.clearChat"), {
    confirmButtonText: t("common.yes"),
    cancelButtonText: t("common.no"),
    type: "warning",
  })
    .then(() => {
      // 执行清空对话
      clearChatByUuid(+uuid);
    })
    .catch(() => {
      ElMessage.info(t("common.success"));
    });
};

/**
 * 导出对话为图片
 */
const handleExport = () => {
  if (isResponding.value) {
    // 如果正在响应 则不执行任何操作 直接返回
    return;
  }

  // 调用ElMessageBox方法 弹出一个消息框
  ElMessageBox({
    title: t("chat.exportImage"),
    message: t("chat.exportImageConfirm"),
    confirmButtonText: t("common.yes"),
    cancelButtonText: t("common.no"),
    showCancelButton: true,
    // 在消息框关闭之前执行的回调函数
    beforeClose: async (action, instance, done) => {
      // 如果点击了确认按钮
      if (action === "confirm") {
        // 将确认按钮的加载状态设置为true
        instance.confirmButtonLoading = true;
        // 将确认按钮的文本设置为"导出中..."
        instance.confirmButtonText = `${t("common.export")}...`;
        try {
          // 获取id为"image-wrapper"的元素
          const ele = document.getElementById("image-wrapper");
          // 使用html2canvas将元素转换为canvas
          const canvas = await html2canvas(ele, { useCORS: true });
          // 将canvas转换为DataURL
          const imgUrl = canvas.toDataURL("image/png");
          // 创建一个<a>元素
          const tempLink = document.createElement("a");
          // 将<a>元素设置为不可见
          tempLink.style.display = "none";
          // 设置<a>元素的链接为DataURL
          tempLink.href = imgUrl;
          // 设置<a>元素的下载属性
          tempLink.setAttribute("download", `chat-shot_${uuid}.png`);

          // 如果浏览器不支持下载属性
          if (typeof tempLink.download === "undefined") {
            // 则设置<a>元素的目标为"_blank"
            tempLink.setAttribute("target", "_blank");
          }

          // 将<a>元素添加到文档中
          document.body.appendChild(tempLink);
          // 模拟<a>元素的点击事件
          tempLink.click();
          // 将<a>元素从文档中移除
          document.body.removeChild(tempLink);
          // 释放URL对象
          window.URL.revokeObjectURL(imgUrl);
          // 执行beforeClose回调函数的done回调，关闭消息框
          done();
        } catch (error) {
          // 捕获异常，显示导出失败的错误信息
          ElMessage.error(t("chat.exportFailed"));
        } finally {
          // 无论导出成功或失败，都将确认按钮的加载状态设置为false
          instance.confirmButtonLoading = false;
          // 并将按钮文本修改为默认值
          instance.confirmButtonText = t("common.yes");
        }
      } else {
        // 如果点击了取消按钮，则执行beforeClose回调函数的done回调，关闭消息框
        done();
      }
    },
  })
    .then(() => {
      // 当消息框关闭且用户点击了确认按钮并成功导出时，显示导出成功的消息
      ElMessage.success(t("chat.exportSuccess"));
    })
    .catch(() => {
      // 当消息框关闭且用户点击了取消按钮时，显示已取消导出的消息
      ElMessage.info(t("common.canceled"));
    });
};

const handleEnter = (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    // 阻止原生事件
    event.preventDefault();
    handleSubmit();
  }
};

const handleSubmit = () => {
  // 调用发送对话的函数
  onConversation();
};

const onConversation = async () => {
  // 如果正在响应 则不发送对话请求
  if (isResponding.value) {
    return;
  }

  // 用户输入的内容
  let message = prompt.value;
  // 如果输入的内容不存在/为空 则不发送对话请求
  if (!message || message.trim() === "") {
    return;
  }

  controller = new AbortController();

  // 将输入的内容添加至对话记录中进行回显
  addChatByUuid(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: message,
    inversion: true,
    error: false,
    conversationOptions: null,
    requestOptions: { prompt: message, options: null },
  });
  scrollToBottom();

  // 响应状态为true
  isResponding.value = true;
  // 清空输入框的内容
  prompt.value = "";

  let options = {};
  const lastContext =
    conversationList.value[conversationList.value.length - 1]?.conversationOptions;

  if (lastContext && usingContext.value) {
    options = { ...lastContext };
  }

  // 添加空的消息记录作为响应内容体
  addChatByUuid(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: "",
    loading: true,
    inversion: false,
    error: false,
    conversationOptions: null,
    requestOptions: { prompt: message, options: { ...options } },
  });
  scrollToBottom();

  try {
    // 上一个消息的内容
    let lastText = "";
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          // 获取响应文本
          const { responseText } = event.target;
          // 只对最后一行进行处理
          const lastIndex = responseText.lastIndexOf("\n", responseText.length - 2);
          let chunk = responseText;
          if (lastIndex !== -1) {
            chunk = responseText.substring(lastIndex);
          }

          try {
            const data = JSON.parse(chunk);
            // 更新响应消息的内容
            updateChatByUuid(+uuid, chatSources.value.length - 1, {
              dateTime: new Date().toLocaleString(),
              text: lastText + (data.text ?? ""),
              inversion: false,
              error: false,
              loading: true,
              conversationOptions: {
                conversationId: data.conversationId,
                parentMessageId: data.id,
              },
              requestOptions: { prompt: message, options: { ...options } },
            });

            // 如果开启长回复内容 并且响应停止的原因是"length"
            if (enableLongReply && data.details.choices[0].finish_reason === "length") {
              options.parentMessageId = data.id;
              lastText = data.text;
              message = "";
              return fetchChatAPIOnce();
            }

            scrollToBottomIfAtBottom();
          } catch (error) {
            //
          }
        },
      });
      // 最后将uuid对应的对话消息体中的loading都更新为false
      updateChatSomeByUuid(+uuid, chatSources.value.length - 1, { loading: false });
    };

    await fetchChatAPIOnce();
  } catch (error) {
    // 获取错误信息
    const errorMessage = error?.message ?? t("common.error");

    // 如果错误原因是主动取消响应
    if (errorMessage === "canceled") {
      // 更新对话记录
      updateChatSomeByUuid(+uuid, chatSources.value.length - 1, { loading: false });
      scrollToBottomIfAtBottom();
      return;
    }

    // 获取当前响应消息对象
    const currentChat = getChatByUuidAndIndex(+uuid, chatSources.value.length - 1);

    // 如果已经响应了部分内容
    if (currentChat?.text && currentChat.text !== "") {
      updateChatSomeByUuid(+uuid, chatSources.value.length - 1, {
        text: `${currentChat.text}\n[${errorMessage}]`,
        error: false,
        loading: false,
      });
      return;
    }

    // 如果还未响应就出现错误了 则将消息体的error设为true
    updateChatByUuid(+uuid, chatSources.value.length - 1, {
      dateTime: new Date().toLocaleString(),
      text: errorMessage,
      inversion: false,
      error: true,
      loading: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    });
    scrollToBottomIfAtBottom();
  } finally {
    isResponding.value = false;
  }
};

onMounted(() => {
  // 滚动至底部
  scrollToBottom();
  if (inputRef.value) {
    inputRef.value?.focus();
  }
});

onUnmounted(() => {
  // 如果组件销毁之前还在进行响应 则直接终止
  if (isResponding.value) {
    controller.abort();
  }
});
</script>
