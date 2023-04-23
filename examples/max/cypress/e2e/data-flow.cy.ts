/// <reference types="cypress" />

describe('data-flow', function () {
  beforeEach(() => {
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    });
  });

  context('dva', () => {
    beforeEach(() => {
      cy.intercept(/dva.async.js$/).as('chunkLoaded');
      cy.visit('/data-flow/dva');
    });

    it('run count model', () => {
      cy.wait('@chunkLoaded');

      cy.contains('count: 0');

      cy.get('button').contains('+').click();

      cy.contains('count: 1');
    });
  });

  context('use-model', () => {
    beforeEach(() => {
      cy.intercept(/use-model.async.js$/).as('chunkLoaded');
      cy.visit('/data-flow/use-model');
    });

    it('render data from use-model', () => {
      cy.wait('@chunkLoaded');

      cy.get('.ant-layout-content').within(() => {
        cy.get('li').contains('foo');
        cy.get('li').contains('bar');
      });
    });
  });
});
