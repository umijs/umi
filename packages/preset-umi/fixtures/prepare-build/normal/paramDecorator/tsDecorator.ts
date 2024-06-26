function tsProp(): any {}

@tsProp()
export class TsUseDecorator {
  @tsProp()
  a = 1;

  @tsProp()
  test(
    @tsProp()
    param: string,
  ) {
    console.log(param);
  }
}
