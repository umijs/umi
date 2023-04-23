/// <reference types="cypress" />

describe('smoke test', () => {
  it('render home ', () => {
    cy.visit('/');
    cy.get('[data-testid="layout-title"]').contains('Vite e2e layout');
    cy.get('h1').contains('with vite');
    cy.get('button').contains('antd btn');
    cy.get('[data-testid="hello"]').contains('Hello world home');
    cy.get('div[data-testid="utils"]').contains('hello utils');
    cy.get('div[data-testid="utils"]').should(
      'have.css',
      'color',
      'rgb(128, 128, 128)',
    );
  });

  it('render about', () => {
    cy.visit('/about');
    cy.get('[data-testid="layout-title"]').contains('Vite e2e layout');
    cy.get('h1').contains('About');
    cy.get('[data-testid="hello"]').contains('Hello world about');
  });
});
