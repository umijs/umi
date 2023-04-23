import renderer from 'react-test-renderer';
import Greet from './Greet';

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

test('name prop can be rendered correctly', () => {
  const component = renderer.create(<Greet name="foo" />);
  const instance = component.root;
  expect(instance.props.name).toEqual('foo');
});

test('click event can be called correctly', () => {
  const fn = vi.fn();
  const component = renderer.create(<Greet onClick={fn} />);
  component.root.props.onClick();
  expect(fn).toBeCalled();
});

test('Greet snapshot', () => {
  const component = renderer.create(<Greet name="snapshot" />);
  const tree = toJson(component);
  expect(tree).toMatchSnapshot();
});
