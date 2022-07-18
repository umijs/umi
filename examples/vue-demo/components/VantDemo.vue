<template>
  <ConfigProvider :theme-vars="themeVars">
    <Form>
      <Field name="rate" label="评分">
        <template #input>
          <Rate v-model="rate" />
        </template>
      </Field>
      <Field name="slider" label="滑块">
        <template #input>
          <Slider v-model="slider" />
        </template>
      </Field>
      <div style="margin: 16px">
        <Button round block type="primary" native-type="submit"> 提交 </Button>
      </div>
    </Form>
  </ConfigProvider>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { ConfigProvider, Form, Field, Rate, Slider, Button } from 'vant';

const rate = ref(4);
const slider = ref(50);

// themeVars 内的值会被转换成对应 CSS 变量
// 比如 sliderBarHeight 会转换成 `--van-slider-bar-height`
const themeVars = {
  rateIconFullColor: '#07c160',
  sliderBarHeight: '4px',
  sliderButtonWidth: '20px',
  sliderButtonHeight: '20px',
  sliderActiveBackgroundColor: '#07c160',
  buttonPrimaryBorderColor: '#07c160',
  buttonPrimaryBackgroundColor: '#07c160',
};
</script>
