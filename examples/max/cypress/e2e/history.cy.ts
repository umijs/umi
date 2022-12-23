/// <reference types="cypress" />

describe('Basic Test', () => {
  beforeEach(() => {
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    });
    cy.clearLocalStorage();

    // 每个测试用例都会先执行一次 `cy.visit(url)` 访问的页面, url 根据测试内容决定
    // 脚手架中已经配置了 baseUrl, 可以直接写 path 部分, PORT 部分可以通过环境变量 PORT 来控制
    cy.visit('/history');
  });

  context('without pathname', () => {
    it('push without pathname', () => {
      cy.get('button').contains('history.push(search)').click();

      cy.contains('t=push');

      cy.url().should('contain', '?t=push');
    });

    it('replace without pathname', () => {
      cy.get('button').contains('history.replace(search)').click();

      cy.contains('t=replace');

      cy.url().should('contain', '?t=replace');
    });
  });

  context('with pathname and query', () => {
    it('push with pathname', () => {
      cy.get('button').contains('history.push(pathname)').click();

      cy.url().should('contain', '?t=push');
      cy.url().should('not.contain', 'history');
    });

    it('replace with pathname', () => {
      cy.get('button').contains('history.replace(pathname)').click();

      cy.url().should('contain', '?t=replace');
      cy.url().should('not.contain', 'history');
    });
  });
});
