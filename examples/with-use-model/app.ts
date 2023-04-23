async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInitialState() {
  await delay(500);
  return {
    name: 'Big Fish',
    size: 'big',
    color: 'blue',
    mood: 'happy',
    food: 'fish',
    location: 'sea',
  };
}
