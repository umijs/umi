/// <reference types="cypress" />

describe('data-flow', function () {
  context('dva', () => {
    beforeEach(() => {
      cy.visit('/data-flow/dva');
    });

    it('run count model', () => {
      cy.intercept(/dva.async.js$/).as('chunkLoaded');

      cy.wait('@chunkLoaded');

      cy.contains('count: 0');

      cy.get('button').contains('+').click();

      cy.contains('count: 1');
    });
  });

  context('use-model', () => {
    beforeEach(() => {
      cy.visit('/data-flow/use-model');
    });

    it('render data from use-model', () => {
      cy.intercept(/use-model.async.js$/).as('chunkLoaded');

      cy.wait('@chunkLoaded');

      cy.get('.ant-layout-content').within(() => {
        cy.get('li').contains('foo');
        cy.get('li').contains('bar');
      });
    });
  });
});
