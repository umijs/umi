import { createContainer } from 'unstated-next';
import { CounterContainer } from './containers/counter';

const allContainers = [CounterContainer];

const composeHooks = (hooks) => () => {
  const reduced = hooks.reduce((acc, hook) => ({ ...acc, ...hook() }), {});
  Object.keys(reduced).filter((stateKey) => {
    return stateKey.includes('State');
  });
  return reduced;
};

const StoreContainer = createContainer(composeHooks(allContainers));

export { StoreContainer };
