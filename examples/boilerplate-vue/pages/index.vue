<template>
  <div>
    <div class="logo">
      <img src="@/assets/vue.png" style="padding-right: 10px" />
      <img src="@/assets/heart.svg" style="padding-right: 10px; width: 30px" />
      <img src="@/assets/umi.png" style="padding-left: 10px" />
    </div>
    <HelloWorld msg="Hello Vue + UmiJs" />
    <div>
      <h4>mock api res:</h4>
      <pre>
        {{ JSON.stringify(res) }}
      </pre>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { terminal } from 'umi';
import HelloWorld from '@/components/HelloWorld.vue';

terminal.log(`Some info from the app`);
terminal.log({
  json: { foo: 'bar' },
});
terminal.info(`Hey terminal, A message from the browser`);
terminal.warn(`Watch out, warning from the browser`);
terminal.error(`Ups, testing an error message from the browser`);

const res = ref();

onMounted(async () => {
  res.value = await fetch('/api/a').then((res) => res.json());
});
</script>
<style lang="less" scoped>
.logo {
  margin-top: 10px;
  display: flex;
}

img {
  width: 64px;
  height: 64px;
}
</style>
