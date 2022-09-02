/// <reference types="cypress" />

describe('safe MF load', () => {
  beforeEach(() =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    }),
  );

  it('supprt raw mf import', () => {
    cy.intercept('GET', 'http://localhost:9000/remote.js').as(
      'specifiedRemote',
    );

    cy.visit('/raw-mf-import');

    cy.wait('@specifiedRemote');

    cy.contains('remote Counter');
  });

  it('supprt raw mf component', () => {
    cy.intercept('GET', 'http://localhost:9000/remote.js').as(
      'specifiedRemote',
    );

    cy.visit('/raw-mf-component');

    cy.wait('@specifiedRemote');

    cy.contains('remote Counter');
  });
});
