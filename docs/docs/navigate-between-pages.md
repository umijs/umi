# Navigate Between Pages

In umi, there are two ways to navigate between pages: declarative and imperative.

## Declarative

it is usually used as a React component.

```bash
import { Link } from 'umi';

export default () => (
   <Link to="/list">Go to list page</Link>
);
```

## Command

Based on `umi/router`, it is usually called in event processing.

```js
import { history } from 'umi';

function goToListPage() {
  history.push('/list');
}
```

You can also get the history directly from the component's properties

```tsx
export default (props) => (
  <Button onClick={()=>props.history.push('/list');}>Go to list page</Button>
);
```

For more command-style jump methods, see [api#history](/api#history).
