<template>
  <h3>List Detail</h3>
  <div>id: {{ route.params.id }}</div>
</template>
<script lang="ts" setup>
import { useRoute } from 'umi';

const route = useRoute();
</script>
