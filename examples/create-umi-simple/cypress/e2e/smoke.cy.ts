/// <reference types="cypress" />

describe('Basic Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('can display ok', () => {
    cy.contains('Yay! Welcome to umi!');
  });
});
