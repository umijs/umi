/// <reference types="cypress" />

describe('Basic Test', () => {
  before(() =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    }),
  );

  it('display mfsu is working', () => {
    cy.intercept('GET', '/mf-va_remoteEntry.js').as('EntryLoaded');
    cy.intercept('GET', '/mf-dep____vendor.*.js').as('DepLoaded');

    cy.visit('/');

    cy.wait('@EntryLoaded');
    cy.wait('@DepLoaded');

    cy.contains('MFSU is working');
  });
});
