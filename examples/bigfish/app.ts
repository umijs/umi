// @ts-ignore
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

export const layout = {
  logout() {
    alert('logout');
  },
};

export function onRouteChange(opts: any) {
  console.log('route changed', opts.location.pathname);
}
