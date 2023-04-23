<template>
  <div>
    <h2>hello</h2>
    <Button type="primary">按钮</Button>
    <div class="flex flex-row my-16">
      <p class="text-slate-900 font-bold text-2xl w-1/3">Sizes</p>
      <div>
        <div class="bg-white w-24 p-4 shadow-2xl rounded-2xl my-4">w-24</div>
        <div class="bg-white w-36 p-4 shadow-2xl rounded-2xl my-4">w-36</div>
        <div class="bg-white w-64 p-4 shadow-2xl rounded-2xl my-4">w-64</div>
        <div class="bg-white w-96 p-4 shadow-2xl rounded-2xl my-4">w-96</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, inject } from 'vue';
import { Button } from 'vant';
</script>
