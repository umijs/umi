import React, { useState } from 'react';

// 创建一个子组件来测试 React Compiler 的优化
function ExpensiveComponent({ count }: { count: number }) {
  // 如果 React Compiler 生效，这个组件只会在 count 变化时重新渲染
  // 即使父组件因为 name 变化而重新渲染，这个组件也不会重新渲染
  console.log('ExpensiveComponent render - count:', count);
  return <div>Expensive Value: {count * 2}</div>;
}

export default function HomePage() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Umi');

  console.log('HomePage render - count:', count, 'name:', name);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <h1>React: {React.version}</h1>
      <p>Forget (React Compiler) is enabled</p>
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
        <p>Hello, {name}!</p>
      </div>
      <button onClick={handleClick}>Count: {count}</button>
      <ExpensiveComponent count={count} />
      <div
        style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}
      >
        <h3>如何验证 Forget 是否生效：</h3>
        <ol>
          <li>
            <strong>测试方法：</strong>修改 name 输入框，观察控制台
          </li>
          <li>
            <strong>如果 React Compiler 生效：</strong>只会看到 "HomePage
            render"，不会看到 "ExpensiveComponent render"
          </li>
          <li>
            <strong>如果 React Compiler 未生效：</strong>会看到两个组件的 render
            日志
          </li>
          <li>
            <strong>点击 Count 按钮：</strong>
            两个组件都应该重新渲染（这是正常的）
          </li>
        </ol>
      </div>
    </div>
  );
}
