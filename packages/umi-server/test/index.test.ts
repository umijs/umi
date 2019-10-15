import server from '../';

describe('test', () => {
  it('normal', () => {
    const render = server({});
    console.log(render());
  });
});
