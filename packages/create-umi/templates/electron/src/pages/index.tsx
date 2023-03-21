import yayJpg from '../assets/yay.jpg';

export default function HomePage() {
  return (
    <div>
      <h2>Yay! Welcome to umi with electron!</h2>
      <p>
        <img src={yayJpg} width="388" />
      </p>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
      <button
        onClick={async () => {
          window.alert(await window.$api.getPlatform());
          window.alert('edit src/main/ipc/platform.ts and try me again!');
        }}
      >
        what is my platform?
      </button>
    </div>
  );
}
