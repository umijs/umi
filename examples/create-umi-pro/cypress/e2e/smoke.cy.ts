/// <reference types="cypress" />

describe('Basic Test', () => {
  beforeEach(() =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    }),
  );

  it('displays some content', () => {
    cy.intercept(/p__Home__index.*\.js/i).as('chunkLoaded');
    cy.intercept(/plugin-layout.*\.js/i).as('layoutLoaded');

    cy.visit('/');

    cy.wait('@layoutLoaded', { timeout: 10000 });
    cy.wait('@chunkLoaded', {
      timeout: Cypress.platform === 'win32' ? 60000 : 10000,
    });

    cy.contains('欢迎使用 Umi Max ！');
  });

  it('access ok', () => {
    cy.visit('/access');

    cy.get('button.ant-btn').contains('只有 Admin 可以看到这个按钮');
  });

  it('simple CRUD ok', () => {
    cy.visit('/table');

    cy.contains('CRUD 示例');
  });
});
