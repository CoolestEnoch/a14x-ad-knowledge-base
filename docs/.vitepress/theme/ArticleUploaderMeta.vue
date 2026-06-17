<template>
  <div v-if="uploader" class="article-uploader-meta">
    <span class="article-uploader-meta-label">上传者</span>
    <span class="article-uploader-meta-name">{{ uploader }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useData } from 'vitepress';

const { frontmatter } = useData();

const uploader = computed(() => {
  const value = frontmatter.value?.uploader;

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(', ');
  }

  return String(value || '').trim();
});
</script>
