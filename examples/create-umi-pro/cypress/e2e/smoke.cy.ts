/// <reference types="cypress" />

describe('Basic Test', () => {
  it('displays some content', () => {
    cy.visit('/');
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
