<template>
  <div class="text-black" :class="wrapClass">
    <div ref="textRef" class="leading-relaxed break-words">
      <div v-if="inversion" class="whitespace-pre-wrap" v-text="content"></div>

      <div v-else>
        <div v-if="asRawText" class="whitespace-pre-wrap" v-text="content"></div>
        <div v-else class="markdown-body" v-html="content"></div>
      </div>

      <template v-if="loading">
        <span class="dark:text-white w-[4px] h-[20px] block animate-blink"></span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, onUpdated, ref } from "vue";
import MarkdownIt from "markdown-it";
import mdKatex from "@traptitech/markdown-it-katex";
import mila from "markdown-it-link-attributes";
import hljs from "highlight.js";
import { copyToClip } from "../../utils/copy";
import { useMobile } from "../../hooks/useMobile";
import { t } from "../../locales";

const props = defineProps({
  inversion: {
    type: Boolean,
    required: true,
  },
  error: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
  },
  asRawText: {
    type: Boolean,
    default: false,
  },
});

const { isMobile } = useMobile();

const textRef = ref();

// 样式计算属性，返回包含一组Tailwind CSS类名的数组
const wrapClass = computed(() => {
  return [
    "text-wrap", // 文本自动换行
    "min-w-[20px]", // 最小宽度为20像素
    "rounded-md", // 圆角边框
    isMobile.value ? "p-2" : "px-3 py-2",
    props.inversion ? "bg-[#d1e9f9]" : "bg-[#f4f6f8]", // 如果props.inversion为真，设置背景色为#d2f9d1，否则设置背景色为#f4f6f8
    props.inversion ? "dark:bg-[#95addc]" : "dark:bg-[#1e1e20]", // 如果props.inversion为真，设置暗模式下的背景色为#a1dc95，否则设置暗模式下的背景色为#1e1e20
    props.inversion ? "message-request" : "message-reply", // 如果props.inversion为真，添加类名"message-request"，否则添加类名"message-reply"
    { "text-red-500": props.error }, // 如果props.error为真，添加类名"text-red-500"
  ];
});

// 消息内容计算属性content
const content = computed(() => {
  const value = props.text ?? ""; // 获取props中的文本值，若未提供则为空字符串
  if (!props.asRawText) {
    return mdi.render(value); // 使用MarkdownIt实例mdi对文本进行渲染，并返回渲染后的结果
  }

  return value; // 直接返回原始文本值
});

// 创建一个MarkdownIt实例
const mdi = new MarkdownIt({
  html: false, // 禁用解析HTML标签
  linkify: true, // 启用自动链接识别
  highlight(code, language) {
    // 自定义代码高亮函数
    const validLang = !!(language && hljs.getLanguage(language)); // 检查语言是否有效
    if (validLang) {
      const lang = language ?? ""; // 获取语言类型，若未提供则为空字符串
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang); // 使用hljs.highlight函数进行代码高亮，并调用highlightBlock函数对高亮结果进行处理
    }
    return highlightBlock(hljs.highlightAuto(code).value, ""); // 自动检测语言并进行代码高亮，并调用highlightBlock函数对高亮结果进行处理
  },
});

// 使用mila插件
mdi.use(mila, { attrs: { target: "_blank", rel: "noopener" } });
// 使用mdKatex插件
mdi.use(mdKatex, { blockClass: "katexmath-block rounded-md p-[10px]", errorColor: " #cc0000" });

// 生成带有代码高亮样式的代码块
const highlightBlock = (str, lang) => {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${t("chat.copyCode")}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`;
};

// 定义函数addCopyEvents，用于添加复制代码的事件处理逻辑
const addCopyEvents = () => {
  // 仅当组件存在时执行
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll(".code-block-header__copy"); // 获取所有复制按钮元素
    copyBtn.forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.parentElement?.nextElementSibling?.textContent; // 获取父元素的下一个兄弟元素的文本内容作为代码
        if (code) {
          copyToClip(code).then(() => {
            btn.textContent = t("common.success"); // 复制成功后修改按钮文本为"复制成功"
            setTimeout(() => {
              btn.textContent = t("chat.copyCode"); // 一秒后恢复按钮文本为"复制代码"
            }, 1000);
          });
        }
      });
    });
  }
};

// 定义函数removeCopyEvents，用于移除复制代码的事件处理逻辑
const removeCopyEvents = () => {
  // 仅当组件存在时执行
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll(".code-block-header__copy"); // 获取所有复制按钮元素
    copyBtn.forEach((btn) => {
      btn.removeEventListener("click", () => {}); // 移除点击事件处理函数
    });
  }
};

// 在组件挂载时执行addCopyEvents函数，添加复制代码的事件处理逻辑
onMounted(() => {
  addCopyEvents();
});

// 在组件更新时执行addCopyEvents函数，更新复制代码的事件处理逻辑
onUpdated(() => {
  addCopyEvents();
});

// 在组件卸载时执行removeCopyEvents函数，移除复制代码的事件处理逻辑
onUnmounted(() => {
  removeCopyEvents();
});
</script>

<style lang="less">
.markdown-body {
  background-color: transparent;
  font-size: 14px;

  p {
    white-space: pre-wrap;
  }

  ol {
    list-style-type: decimal;
  }

  ul {
    list-style-type: disc;
  }

  pre code,
  pre tt {
    line-height: 1.65;
  }

  .highlight pre,
  pre {
    background-color: #fff;
  }

  code.hljs {
    padding: 0;
  }

  .code-block {
    &-wrapper {
      position: relative;
      padding-top: 24px;
    }

    &-header {
      position: absolute;
      top: 5px;
      right: 0;
      width: 100%;
      padding: 0 1rem;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      color: #b3b3b3;

      &__copy {
        cursor: pointer;
        margin-left: 0.5rem;
        user-select: none;

        &:hover {
          color: #65a665;
        }
      }
    }
  }
}

html.dark {
  .message-reply {
    .whitespace-pre-wrap {
      white-space: pre-wrap;
      color: var(--n-text-color);
    }
  }

  .highlight pre,
  pre {
    background-color: #282c34;
  }
}
</style>
