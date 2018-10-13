export default function(chunks) {
  return chunks.reduce((memo, chunk) => {
    memo[chunk.name || chunk.id] = chunk.files;
    return memo;
  }, {});
}
