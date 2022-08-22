/// <reference types="cypress" />

describe('Detail Test', () => {
  it('render detail ', () => {
    cy.visit('/foo/list/456');
    cy.get('h3').contains('List Detail');
    cy.get('div').contains('id: 456');
  });
});
