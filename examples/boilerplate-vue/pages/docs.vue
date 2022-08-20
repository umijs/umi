<template>
  <h2>DocPage</h2>
  <div ref="content"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
// @ts-ignore
import marked from 'marked';

const content = ref();

onMounted(() => {
  content.value.innerHTML = marked.parse(
    '# Marked in the browser\n\nRendered by **marked**.',
  );
});
</script>
