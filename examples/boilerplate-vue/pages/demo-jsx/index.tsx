import type { CSSProperties } from 'vue';
import { defineComponent, ref } from 'vue';
// @ts-ignore
import vPng from '@/assets/vue.png';

const Child = defineComponent({
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    modelModifiers: {
      default: () => ({ double: false }),
    },
  },
  setup(props, { emit }) {
    const handleClick = () => {
      emit('update:modelValue', 3);
    };
    return () => (
      <button onClick={handleClick}>
        {props.modelModifiers.double ? props.modelValue * 2 : props.modelValue}
      </button>
    );
  },
});

// @ts-ignore
const FnDemo = () => <div class="fn">fn 123</div>;

export default defineComponent({
  setup() {
    const foo = ref(0);

    const propsA = {
      style: {
        color: 'red',
      } as CSSProperties,
    };
    const propsB = {
      style: {
        color: 'blue',
        width: '300px',
        height: '300px',
      } as CSSProperties,
    };

    return () => (
      // @ts-ignore
      <div {...propsA} {...propsB}>
        <h2>Jsx Demo</h2>
        {/* @ts-ignore */}
        <Child v-model_double={foo.value} />
        <FnDemo />
        <h3>foo: {foo.value}</h3>
        <input v-model={foo.value} />
        {/* @ts-ignore */}
        <img src={vPng} style="padding-left: 20px; margin-top: 20px;" />
      </div>
    );
  },
});
