function getCoverageText(count: number) {
  if (count > 0) {
    return 'ISTANBUL_PLUGIN_SOURCE_EXECUTED';
  }

  return 'ISTANBUL_PLUGIN_SOURCE_NOT_EXECUTED';
}

export default function HomePage() {
  const coverageText = getCoverageText(1);

  return (
    <main>
      <h1>Utoopack extraBabelPlugins</h1>
      <p>
        babel-plugin-istanbul status:{' '}
        <strong data-testid="istanbul-status">{coverageText}</strong>
      </p>
    </main>
  );
}
