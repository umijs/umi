/// <reference types="cypress" />

describe('Basic Test', () => {
  before(() =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    }),
  );

  afterEach(() => {
    cy.exec('git checkout src/utils/format.ts');
  });

  it('display mfsu is working', () => {
    cy.intercept('GET', '/mf-va_remoteEntry.js').as('EntryLoaded');

    cy.visit('/');

    cy.wait('@EntryLoaded');

    cy.contains('MFSU is working');
  });

  it('display foo', () => {
    cy.intercept('GET', '/mf-va_remoteEntry.js').as('EntryLoaded');

    cy.visit('/');

    cy.wait('@EntryLoaded');

    cy.contains('foo');
  });

  it('display mfsu working after rebuild', () => {
    cy.intercept('GET', '/mf-va_remoteEntry.js').as('EntryLoaded');

    cy.visit('/');

    cy.wait('@EntryLoaded');

    cy.contains('MFSU is working');

    cy.exec('cp -f src/utils/format.ts.txt src/utils/format.ts');

    cy.reload();

    cy.contains('MFSU IS WORKING');
  });
});
