<template>
  <div>
    <h1>umi & vue</h1>
    <h2>{{ hello }}</h2>
    <h3>{{ umiHello }}</h3>

    <div>
      <router-link to="/users">Go to Users</router-link>
    </div>
    <div>
      <router-link to="/users/foo">Go to Users Foo</router-link>
    </div>
    <VantDemo />
    <div>
      <h4>useAppData</h4>
      <pre>{{ app }}</pre>
    </div>
    <img src="{{ error }}" alt="测试vite模式错误图片加载" />
  </div>
</template>
<script lang="ts" setup>
import { ref, inject } from 'vue';
import { useAppData } from 'umi';
import VantDemo from '@/components/VantDemo.vue';

const hello = ref<string>('hello vue');
const app = useAppData();

const umiHello = inject('umi-hello');
</script>
<style lang="less" scoped>
div {
  font-size: 24px;
}
</style>
