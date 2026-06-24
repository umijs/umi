const { parse: _parse } =
  require('../../vendors/importParser/_importParser.js') as {
    parse: (code: string) => {
      from: string;
      imports: string[];
    }[];
  };

export default function parse(code: string): {
  from: string;
  imports: string[];
}[] {
  return _parse(code);
}
