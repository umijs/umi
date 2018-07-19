export default function(chunks) {
  return chunks.reduce((memo, chunk) => {
    memo[chunk.name] = chunk.files;
    return memo;
  }, {});
}
