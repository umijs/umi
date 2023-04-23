export async function reverseApiData(url: string, fetcher = fetch) {
  const res = await fetcher(url);
  const json = await res.json();

  const { data = {} } = json;
  const reversed: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    reversed[val] = key;
  }
  return reversed;
}
