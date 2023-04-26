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

    cy.visit('/');

    cy.wait('@EntryLoaded');

    cy.get<HTMLInputElement>('.ant-picker-input input').should(
      'have.value',
      '2022-01-01',
    );
  });
});
