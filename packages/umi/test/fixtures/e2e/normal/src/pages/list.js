import router from 'umi/router';

function goBack() {
  router.goBack();
}

export default () => (
  <>
    <h1>list</h1>
    <button onClick={goBack}>back</button>
  </>
);
