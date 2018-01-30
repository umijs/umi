import router from 'umi/router';

export default () => {
  return (
    <div>
      ListPage
      <br />
      <button
        onClick={() => {
          router.goBack();
        }}
      >
        go back
      </button>
    </div>
  );
};
