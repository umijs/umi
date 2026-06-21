async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInitialState() {
  await delay(50);
  return {
    name: 'React 19',
  };
}
