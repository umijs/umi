import("./popcnt.wasm").then(popcnt => {
  console.log(popcnt.main(0xF0F));
})