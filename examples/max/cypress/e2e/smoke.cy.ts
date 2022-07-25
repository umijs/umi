/// <reference types="cypress" />

describe('Basic Test', () => {
  beforeEach(() => {
    // 每个测试用例都会先执行一次 `cy.visit(url)` 访问的页面, url 根据测试内容决定
    // 脚手架中已经配置了 baseUrl, 可以直接写 path 部分, PORT 部分可以通过环境变量 PORT 来控制
    cy.visit('/');
  });

  it('display page normallly', () => {
    // 页面正常渲染
    cy.contains('index page');

    // antd 组件存在
    cy.get('button').contains('Button');
    cy.get('input.ant-input').should('have.attr', 'type', 'text');
    cy.get('div.ant-picker').find('input');
  });

  it('use pro-layout and render menus', () => {
    // layout 存在
    cy.contains('Ant Design Pro');

    cy.get('li.ant-pro-menu-item').contains('Index');
    cy.get('li.ant-pro-menu-item').contains('users');
    cy.get('li.ant-pro-menu-item').contains('app1');
    cy.get('li.ant-pro-menu-submenu').contains('data-flow');
  });

  it('render sub-menu', () => {
    cy.get('li.ant-pro-menu-submenu').contains('data-flow').click();

    cy.get('li.ant-pro-menu-item').contains('use-model');
    cy.get('li.ant-pro-menu-item').contains('dva');
  });

  it('can change local', () => {
    cy.get('.ant-dropdown-trigger').find('i.anticon').click();

    cy.contains('简体中文').click();
    cy.get('li.ant-pro-menu-item').contains('首页');
  });

  it('tailwind css', () => {
    cy.get('[data-testid="tailwind-header"]').should(
      'have.css',
      'color',
      'rgb(136, 19, 55)',
    );
  });
});
