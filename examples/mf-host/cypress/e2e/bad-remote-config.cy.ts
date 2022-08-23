/// <reference types="cypress" />

describe('safe MF load', () => {
  beforeEach(() =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    }),
  );

  it('can fallback with bad remote', () => {
    cy.intercept('GET', 'http://1.2.3.4:404/bad_file.js', {
      statusCode: 404,
    }).as('badRequest');

    cy.visit('/bad-remote');

    cy.wait('@badRequest');

    cy.contains('Page is Loaed');
    cy.contains('Fallback-Success');
  });

  it('can fallback with non-exists remote', () => {
    cy.visit('/no-exists-remote');

    cy.contains('Page is Loaed');
    cy.contains('everyone writes bugs');
  });
});
