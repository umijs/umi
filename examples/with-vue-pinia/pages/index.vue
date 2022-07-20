<template>
  <div>
    <h2>UmiJS x Vue Pinia</h2>
    <div class="count">{{ counter.count }}</div>
    <div class="buttons">
      <button @click="onAdd">+</button>
      <button @click="counter.decrease">-</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, inject } from 'vue';
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();

const onAdd = () => {
  counter.increment();
};
</script>
<style lang="less" scoped>
.count {
  text-align: center;
  font-size: 30px;
  color: red;
  font-weight: bold;
}

.buttons {
  display: flex;

  button {
    & + button {
      margin-left: 15px;
    }
  }
}
</style>
