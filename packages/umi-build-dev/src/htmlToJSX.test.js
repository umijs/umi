import htmlToJSX from './htmlToJSX';

describe('htmlToJSX', () => {
  describe('html attributes', function() {
    test('class should be repleaced with className', function() {
      expect(htmlToJSX('<div class="foobar"></div>')).toEqual('<div className="foobar"></div>');
    });

    test('for should be repleaced with htmlFor', function() {
      expect(htmlToJSX('<label for="foobar"></label>')).toEqual('<label htmlFor="foobar"></label>');
    });

    test('attributes should be camelCased', function() {
      expect(htmlToJSX('<input type="text" maxlength="10" minlength="0"/>')).toEqual(
        '<input type="text" maxLength="10" minLength="0"/>',
      );
    });
  });

  describe('html tags', function() {
    test('should have root element', function() {
      expect(htmlToJSX('<div><div>foo</div><div>bar</div></div>')).toEqual(
        '<div><div>foo</div><div>bar</div></div>',
      );
    });

    test('should have backslash', function() {
      expect(htmlToJSX('<div><br><hr><img src=""><input type="text"><a>foo</a></div>')).toEqual(
        '<div><br /><hr /><img src="" /><input type="text" /><a>foo</a></div>',
      );
    });

    test('close tag', () => {
      expect(htmlToJSX(`<link href="/umi.js">`)).toEqual(`<link href="/umi.js" />`);
    });

    test('close tag', () => {
      expect(htmlToJSX(`<link href="/umi.js" />`)).toEqual(`<link href="/umi.js" />`);
    });

    test('style tag', () => {
      expect(htmlToJSX(`<style>h1 {background: url(\'http://foo.bar/img.jpg\';}</style>`)).toEqual(
        "<style dangerouslySetInnerHTML={{ __html: `h1 {background: url('http://foo.bar/img.jpg';}` }} />",
      );
    });
  });

  describe('comments', function() {
    test('should be replaced to jsx comment', function() {
      expect(htmlToJSX('<!-- this is a comment -->')).toEqual('{/* this is a comment */}');
    });
  });

  describe('inline-style', function() {
    test('should be repleaced with js object', function() {
      expect(htmlToJSX('<div style="line-height: 49px; margin: 1px 0 2px;"></div>')).toEqual(
        "<div style={{lineHeight: '49px', margin: '1px 0 2px'}}></div>",
      );
    });
  });
});
