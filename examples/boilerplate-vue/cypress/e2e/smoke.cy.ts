/// <reference types="cypress" />

describe('Basic Test', () => {
  beforeEach(() => {
    // 每个测试用例都会先执行一次 `cy.visit(url)` 访问的页面, url 根据测试内容决定
    // 脚手架中已经配置了 baseUrl, 可以直接写 path 部分, PORT 部分可以通过环境变量 PORT 来控制
    cy.visit('/');
  });

  it('display page normallly', () => {
    // 页面正常渲染
    cy.contains('Hello Vue + UmiJs');
    cy.contains('components/HelloWorld.vue');
    cy.contains('{"a":1');

    // 按钮存在
    cy.get('button').contains('count is');
  });

  it('use layout', () => {
    // layout 布局
    cy.contains('BoulerplateVue');

    cy.get('.nav a').contains('Home');
    cy.get('.nav a').contains('Docs');
    cy.get('.nav a').contains('About');
    cy.get('.nav a').contains('List');
  });

  it('render docs', () => {
    cy.get('.nav a').contains('Docs').click();

    cy.get('h2').contains('DocPage');
    cy.get('h1').contains('Marked in the browser');
  });

  it('render about', () => {
    cy.get('.nav a').contains('About').click();
    cy.get('h2').contains('About Page');
  });

  it('render list', () => {
    cy.get('.nav a').contains('List').click();
    cy.get('h2').contains('ListPage');

    // wrapper 是否支持
    cy.get('h2').contains('Wrapper hello');
    cy.get('a').contains('list foo');
  });
});
