/// <reference types="cypress" />

describe('smoke test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('rediect to login page', () => {
    cy.contains('Ant Design');

    cy.get('#username').type('admin');
    cy.get('#password').type('ant.design');

    cy.get('button.ant-btn').click();

    cy.url().should('include', '/welcome');
  });
});
