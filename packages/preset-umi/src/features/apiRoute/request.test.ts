import { parseMultipart, parseUrlEncoded } from './request';

test('parse multipart/form-data of api route request into object', () => {
  // Example from Postman request
  const contentType =
    'multipart/form-data; boundary=--------------------------644202596647731933964997';
  const body = Buffer.from(
    `"----------------------------644202596647731933964997\r\nContent-Disposition: form-data; name=\"username\"\r\n\r\nyuaanlin\r\n----------------------------644202596647731933964997\r\nContent-Disposition: form-data; name=\"gender\"\r\n\r\nmale\r\n----------------------------644202596647731933964997\r\nContent-Disposition: form-data; name=\"bio\"\r\n\r\nHello~\nMy name is yuanlin~\r\n----------------------------644202596647731933964997--\r\n"`,
    'utf-8',
  );

  const boundary = contentType.split('boundary=')[1];
  const parsed = parseMultipart(body, boundary);

  expect(parsed).toStrictEqual({
    username: 'yuaanlin',
    gender: 'male',
    bio: `Hello~\nMy name is yuanlin~`,
  });
});

test('parse urlencoded form of api route request into object', () => {
  // Example from Postman request
  const body =
    'username=yuaanlin&bio=Hello~%0AMy%20name%20is%20yuanlin~&gender=male';

  const parsed = parseUrlEncoded(body);

  expect(parsed).toStrictEqual({
    username: 'yuaanlin',
    gender: 'male',
    bio: `Hello~\nMy name is yuanlin~`,
  });
});
