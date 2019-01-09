import router from 'umi/router';

export default function() {
  return (
    <div>
      <h1>List Page</h1>
      <button
        onClick={() => {
          router.goBack();
        }}
      >
        返回
      </button>
    </div>
  );
}
