/// <reference types="cypress" />

describe('smoke test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('rediect to login page', () => {
    cy.contains('Ant Design');
    cy.contains('Ant Design 是西湖区最具影响力的 Web 设计规范');

    cy.get('#username').type('admin')
    cy.get('#password').type('ant.design')

    cy.url().should('include', '/welcome');
  });
});
