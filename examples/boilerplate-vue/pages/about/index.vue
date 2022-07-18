<template>
  <h2>About Page</h2>
  <div>
    <pre>{{ route.path }}{{ route.params }}</pre>
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from 'umi';

const route = useRoute();
</script>
