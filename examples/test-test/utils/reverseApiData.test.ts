import { reverseApiData } from './reverseApiData';

test('reverseApiData use fetcher to request url', async () => {
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({}),
  });

  await reverseApiData('https://api.end/point', fetcher);

  expect(fetcher).toBeCalledWith('https://api.end/point');
});

test('reverseApiData reverse empty object', async () => {
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: {} }),
  });

  const reversed = await reverseApiData('url', fetcher);

  expect(reversed).toEqual({});
});

test('reverseApiData reverse simple object', async () => {
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: { a: 'b' } }),
  });

  const reversed = await reverseApiData('url', fetcher);

  expect(reversed).toEqual({ b: 'a' });
});

test('reverseApiData reverse with array value', async () => {
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: { a: ['b', 'c'] } }),
  });

  const reversed = await reverseApiData('url', fetcher);

  expect(reversed).toEqual({ 'b,c': 'a' });
});

test('reverseApiData reverse with array value', async () => {
  const fetcher = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: { a: ['b', 'c'] } }),
  });

  const reversed = await reverseApiData('url', fetcher);

  expect(reversed).toEqual({ 'b,c': 'a' });
});
