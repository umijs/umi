/// <reference types="cypress" />

describe('safeMfImport', () => {
  before(() =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    }),
  );

  it('can fallback', () => {
    cy.intercept('GET', 'http://127.0.0.1:9000/remote.js').as('remoteLoaded');

    cy.visit('/safe-import');

    cy.wait('@remoteLoaded');

    cy.contains('MF Host');
  });

  context('Hooks verification', () => {
    it('remote hooks works', () => {
      cy.visit('/safe-import');

      cy.get('[data-testid="remote-counter"]').should('have.text', '10');
      cy.get('[data-testid="remote-button"]').click();
      cy.get('[data-testid="remote-counter"]').should('have.text', '11');
    });

    it('host hooks works', () => {
      cy.visit('/safe-import');

      cy.get('[data-testid="host-counter"]').should('have.text', '42');
      cy.get('[data-testid="host-button"]').click();
      cy.get('[data-testid="host-counter"]').should('have.text', '43');
    });
  });
});

describe('safeMfImport with dynamic registered remote', function () {
  it('can load registered remote', () => {
    cy.visit('/register-then-import');

    cy.contains('remote Counter');
  });
});

describe('safeMfImport with dynamic registered remote', function () {
  it('can load registered remote', () => {
    cy.visit('/safe-remote-component');

    cy.get('[data-testid="remote-counter"]').should('have.text', '808');
  });
});
