import expect from 'expect';
import HtmlGenerator from './HtmlGenerator';

describe('HtmlGenerator.getHtmlPath', () => {
  it('no htmlSuffix', () => {
    const hg = new HtmlGenerator({
      config: {},
    });
    expect(hg.getHtmlPath('/')).toEqual('index.html');
    expect(hg.getHtmlPath('/list/')).toEqual('list/index.html');
    expect(hg.getHtmlPath('/list/list')).toEqual('list/list/index.html');
    expect(hg.getHtmlPath('/list/list/')).toEqual('list/list/index.html');
  });

  it('with htmlSuffix', () => {
    const hg = new HtmlGenerator({
      config: {
        exportStatic: {
          htmlSuffix: true,
        },
      },
    });
    expect(hg.getHtmlPath('/')).toEqual('index.html');
    expect(hg.getHtmlPath('/list.html')).toEqual('list.html');
    expect(hg.getHtmlPath('/list/list.html')).toEqual('list/list.html');
  });
});
