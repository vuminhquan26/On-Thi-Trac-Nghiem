<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css' // Theme tối màu cho khối code

const props = defineProps<{
  content: string
}>()

// Cấu hình Markdown-it kết hợp với Highlight.js
const md = new MarkdownIt({
  html: true,
  breaks: true, // Tự động xuống dòng
  linkify: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs p-4 rounded-lg overflow-x-auto my-2 text-sm"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) {}
    }
    // Backup nếu không nhận diện được ngôn ngữ
    return `<pre class="hljs p-4 rounded-lg overflow-x-auto my-2 text-sm"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
})

const parsedContent = computed(() => {
  return md.render(props.content || '')
})
</script>

<template>
  <div class="markdown-content text-gray-800" v-html="parsedContent"></div>
</template>

<style>
/* Reset một vài margin mặc định của thẻ p trong markdown để giao diện gọn hơn */
.markdown-content p {
  margin-bottom: 0.5rem;
}
.markdown-content p:last-child {
  margin-bottom: 0;
}
.markdown-content code:not(pre code) {
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  color: #ef4444;
  font-size: 0.875em;
}
</style>