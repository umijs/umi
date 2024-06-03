export async function load(x: string) {

  return import(`./${x}`)
}
