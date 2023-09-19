<template>
  <el-scrollbar class="px-4">
    <div class="flex flex-col gap-2 text-sm">
      <template v-if="!chatSources.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <SvgIcon name="ri:inbox-line" class="mb-2 text-3xl" />
          <span>暂无对话记录</span>
        </div>
      </template>

      <template v-else>
        <div v-for="(item, index) of chatSources" :key="index">
          <a
            class="relative flex items-center gap-3 px-3 py-3 break-all border rounded-md cursor-pointer hover:bg-neutral-100 group dark:border-neutral-800 dark:hover:bg-[#24272e]"
            :class="
              isActive(item.uuid) && [
                'border-[#12a6eb]',
                'bg-neutral-100',
                'text-[#12a6eb]',
                'dark:bg-[#24272e]',
                'dark:border-[#12a6eb]',
                'pr-14',
              ]
            "
            @click="handleClickChat(item)"
          >
            <span>
              <SvgIcon name="ri:message-3-line" />
            </span>

            <div class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap">
              <el-input
                v-if="item?.isEdit"
                v-model="item.title"
                size="small"
                @change="handleEnter(item, false)"
              />
              <span v-else>{{ item.title }}</span>
            </div>

            <div v-if="isActive(item.uuid)" class="absolute z-10 flex visible right-1">
              <template v-if="item.isEdit">
                <button class="p-1">
                  <SvgIcon name="ri:save-line" @click="handleEdit(item, false)" />
                </button>
              </template>
              <template v-else>
                <button class="p-1">
                  <SvgIcon name="ri:edit-line" @click="handleEdit(item, true)" />
                </button>
                <el-popconfirm title="确定删除该对话记录?" @confirm="handleDeleteDebounce(index)">
                  <template #reference>
                    <button class="p-1">
                      <SvgIcon name="ri:delete-bin-line" />
                    </button>
                  </template>
                </el-popconfirm>
              </template>
            </div>
          </a>
        </div>
      </template>
    </div>
  </el-scrollbar>
</template>

<script setup>
import { computed, defineAsyncComponent } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore, useChatStore } from "../../stores";
import { useMobile } from "../../hooks/useMobile";
import { debounce } from "../../utils/debounce";

const SvgIcon = defineAsyncComponent(() => import("../../components/Icon/SvgIcon.vue"));

const { isMobile } = useMobile();

const appStore = useAppStore();
const { setSiderCollapsed } = appStore;
// 导入 useChatStore 函数并将返回的 store 对象赋值给 chatStore
const chatStore = useChatStore();
// 从 chatStore 中解构出 updateHistory、setActive 和 deleteHistory 函数
const { updateHistory, setActive, deleteHistory } = chatStore;
// 使用 storeToRefs 将 chatStore 的 active 属性转换为 ref
const { active, history } = storeToRefs(chatStore);

const chatSources = computed(() => history.value);

// 判断给定的 UUID 是否为当前激活的 UUID
const isActive = (uuid) => {
  return active.value === uuid;
};

// 点击聊天时的处理函数
const handleClickChat = async ({ uuid }) => {
  // 如果点击的聊天已经是激活状态，则不执行任何操作
  if (isActive(uuid)) {
    return;
  }

  // 如果已经有激活的聊天，则更新其历史记录
  if (active.value) {
    updateHistory(active.value, { isEdit: false });
  }

  // 设置点击的聊天为激活状态
  await setActive(uuid);

  // 如果设备是移动设备，则折叠侧边栏
  if (isMobile.value) {
    setSiderCollapsed(true);
  }
};

// 编辑聊天时的处理函数
const handleEdit = ({ uuid }, isEdit) => {
  // 更新具有给定 UUID 的聊天的历史记录以反映新的编辑状态
  updateHistory(uuid, { isEdit });
};

// 删除聊天时的处理函数
const handleDelete = (index) => {
  // 删除指定索引处的聊天历史记录
  deleteHistory(index);

  // 如果设备是移动设备，则折叠侧边栏
  if (isMobile.value) {
    setSiderCollapsed(true);
  }
};

// 使用 600 毫秒的延迟对 handleDelete 函数应用防抖函数
const handleDeleteDebounce = debounce(handleDelete, 600);

// 处理 "Enter" 键按下事件的处理函数
const handleEnter = ({ uuid }, isEdit) => {
  // 更新具有给定 UUID 的聊天的历史记录以反映新的编辑状态
  updateHistory(uuid, { isEdit });
};
</script>
