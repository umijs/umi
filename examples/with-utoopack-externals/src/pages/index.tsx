import lodashFromChunk from 'lodash/fp/chunk';
import lodashFromOmit from 'lodash/omit';

export default function HomePage() {
  return (
    <main>
      <h1>Utoopack externals</h1>
      <p data-testid="externals-status">
        lodash deep imports are configured as webpack-style glob externals.
      </p>
      <pre>
        {JSON.stringify(
          {
            omit: typeof lodashFromOmit,
            chunk: typeof lodashFromChunk,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}
