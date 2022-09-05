/// <reference types="cypress" />

describe('import by dynamic import', () => {
  before(() =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    }),
  );

  it('loads page successfully', () => {
    cy.intercept('GET', 'http://127.0.0.1:9000/remote.js').as('remoteLoaded');

    cy.visit('/dynamic-import');

    cy.wait('@remoteLoaded');

    cy.contains('MF Host');
  });

  context('Hooks verification', () => {
    it('remote hooks works', () => {
      cy.visit('/dynamic-import');

      cy.get('[data-testid="remote-counter"]').should('have.text', '10');
      cy.get('[data-testid="remote-button"]').click();
      cy.get('[data-testid="remote-counter"]').should('have.text', '11');
    });

    it('host hooks works', () => {
      cy.visit('/dynamic-import');

      cy.get('[data-testid="host-counter"]').should('have.text', '42');
      cy.get('[data-testid="host-button"]').click();
      cy.get('[data-testid="host-counter"]').should('have.text', '43');
    });
  });
});
