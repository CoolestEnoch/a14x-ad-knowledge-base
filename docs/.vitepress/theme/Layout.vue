<template>
  <DefaultTheme.Layout>
    <template #layout-bottom>
      <ChatWidget />
    </template>
  </DefaultTheme.Layout>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import ChatWidget from './ChatWidget.vue';

const route = useRoute();

// MathJax 客户端渲染：首次加载 + 每次路由切换后重新排版
function typesetMath() {
  nextTick(() => {
    if (window.MathJax?.typesetPromise) {
      MathJax.typesetPromise();
    } else {
      // MathJax 还没加载完，等一会儿再试
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.MathJax?.typesetPromise) {
          clearInterval(interval);
          MathJax.typesetPromise();
        } else if (++attempts > 50) {
          clearInterval(interval);
        }
      }, 200);
    }
  });
}

onMounted(typesetMath);
watch(() => route.path, typesetMath);
</script>
