@decorator
class TestDecorator {
  render() {
    return '1';
  }
}

function decorator(x) {
  return x;
}

export { TestDecorator };
