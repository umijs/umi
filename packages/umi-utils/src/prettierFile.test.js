import prettierFile from './prettierFile';

test('normal', () => {
  expect(
    prettierFile(`export default function RouterWrapper(props = {}) {
  return (
<RendererWrapper0>
          <Router history={history}>
      { renderRoutes(routes, props) }
    </Router>
        </RendererWrapper0>
  );
}`),
  ).toEqual(`export default function RouterWrapper(props = {}) {
  return (
    <RendererWrapper0>
      <Router history={history}>{renderRoutes(routes, props)}</Router>
    </RendererWrapper0>
  );
}
`);
});

test('less', () => {
  expect(
    prettierFile(
      `.normal {font-family: Georgia, sans-serif;
margin-top: 4em;text-align: center;}`,
      'less',
    ),
  ).toEqual(`.normal {
  font-family: Georgia, sans-serif;
  margin-top: 4em;
  text-align: center;
}
`);
});
