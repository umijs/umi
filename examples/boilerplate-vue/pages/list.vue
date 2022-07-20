<template>
  <h2>ListPage</h2>
  <div class="list">
    <router-link to="/list">list</router-link>
    <router-link to="/list/foo">list foo</router-link>
    <router-link to="/list/233">list detail</router-link>
  </div>
  <button @click="onGo">go to detail</button>
  <div>
    <router-view></router-view>
  </div>
</template>
<script lang="ts" setup>
import { useRouter } from 'umi';

const router = useRouter();

const onGo = () => {
  router.push('/list/456');
};
</script>
<style lang="less" scoped>
.list {
  display: flex;
  flex-direction: column;
}
</style>
