/// <reference types="cypress" />

// 欢迎开启你的 cypress e2e 测试!
//
// 这里给出一个简单的cypress e2e测试例子
//
// Cypress 是一个强大的 e2e 测试工具, 更多的信息请参见
// https://on.cypress.io/introduction-to-cypress

// 按照惯例 测试文件的文件名需要满足 cypress/e2e/**/*.cy.{ts,js}

describe('Basic Test', () => {
  beforeEach(() => {
    // 每个测试用例都会先执行一次 `cy.visit(url)` 访问的页面, url 根据测试内容决定
    // 脚手架中已经配置了 baseUrl, 可以直接写 path 部分, PORT 部分可以通过环境变量 PORT 来控制
    cy.visit('/');
  });

  it('displays some content', () => {
    // 测试页面是否包含某些内容
    // 可以文档 也可以是 css selector, 详情请参见
    // contains https://docs.cypress.io/api/commands/contains
    cy.contains('Welcome to Umi!');
  });

  it('goes to another page when click', () => {
    // cypress 使用 cy 来编排我们测试中命令的顺序, 编排的过程的是同步的, 但执行是异步的
    // 所以需要我们清晰,简单,直接地来描述我们的用例.

    // get 命令帮我们找到某个元素, 详情请参见 https://docs.cypress.io/api/commands/get
    // contains 命令继续帮我们筛选元素,
    // click 命令点击元素,完成跳转, 详情请参见 https://docs.cypress.io/api/commands/click
    cy.get('button').contains('my button').click();

    // url 返回当前页面的 url, https://docs.cypress.io/api/commands/url
    // should 断言当前页面的 url 是否是新的链接, 详情请参见
    cy.url().should('include', '/new/url/path');
  });
});
