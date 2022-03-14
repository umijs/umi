// unicode character syntax
console.log(/[\u{20000}-\u{2a6df}]/u);

// unicode mark syntax
console.log(/\p{Script=Han}+|\p{Punctuation}/ug);
