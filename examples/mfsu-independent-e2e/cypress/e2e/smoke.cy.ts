/// <reference types="cypress" />

describe('MFSU independent', () => {
  it('dev normal display', () => {
    cy.visit('/');

    cy.get('[data-testid="mf-counter"]').should('have.value', '0');
    cy.get('[data-testid="mf-button"]').click();
    cy.get('[data-testid="mf-counter"]').should('have.value', '1');
  });

  it('navigate to another pages', () => {
    cy.visit('/pageTwo.html'); // relative entry
    cy.visit('/pageThree.html'); // full path entry
  });
});
