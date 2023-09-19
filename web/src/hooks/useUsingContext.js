import { storeToRefs } from "pinia";
import { useChatStore } from "../stores";
import { ElMessage } from "element-plus";

export const useUsingContext = () => {
  const chatStore = useChatStore();
  const { usingContext } = storeToRefs(chatStore);

  // 切换是否使用上下文的状态
  const toggleUsingContext = () => {
    chatStore.setUsingContext(!usingContext.value);

    if (usingContext.value) {
      // 如果值为true 则开启上下文记忆功能
      ElMessage.success("当前模式下, 发送消息会携带之前的聊天记录");
    } else {
      // 如果值为false 则关闭上下文记忆功能
      ElMessage.warning("当前模式下, 发送消息不会携带之前的聊天记录");
    }
  };

  // 返回usingContext属性和toggleUsingContext方法
  return {
    usingContext,
    toggleUsingContext,
  };
};
