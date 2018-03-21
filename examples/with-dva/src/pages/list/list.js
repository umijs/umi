import router from 'umi/router';

export default () => {
  return (
    <div>
      <h1>list/list</h1>
      <button
        onClick={() => {
          router.goBack();
        }}
      >
        back
      </button>
    </div>
  );
};
