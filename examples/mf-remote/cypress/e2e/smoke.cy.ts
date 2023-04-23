/// <reference types="cypress" />

describe('plugin-mf x MFSU', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('dev normal display', () => {
    cy.contains('remote Counter');

    cy.get('[data-testid="remote-counter"]').should('have.text', 10);
    cy.get('[data-testid="remote-button"]').click();
    cy.get('[data-testid="remote-counter"]').should('have.text', 11);
  });
});
