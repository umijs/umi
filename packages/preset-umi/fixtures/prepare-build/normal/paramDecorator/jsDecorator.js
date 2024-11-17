function prop() {}

export class UseDecorator {
  @prop()
  a = 1;

  fn(
    @prop()
    jsParam,
  ) {
    console.log(a);
  }
}
