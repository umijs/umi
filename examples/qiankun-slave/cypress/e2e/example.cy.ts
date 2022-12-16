/// <reference types="cypress" />

describe('QianKun Plugin', () => {
  beforeEach(() => {});

  it('can navigate to slave', () => {
    // contains https://docs.cypress.io/api/commands/contains
    cy.visit('/home');
    cy.get('button').click();

    cy.contains('Slave Home Page');
  });

  it('support hooks in slave app', () => {
    cy.visit('/slave/count');

    cy.contains('slave Count');
    cy.contains('count:0');
    cy.get('button').click();
    cy.contains('count:1');
  });

  describe('manual loaded app', function () {
    it('be loaded', () => {
      cy.visit('/manual-slave/home');

      cy.contains('Slave Home Page');
    });

    it('support hooks in slave app', () => {
      cy.visit('/manual-slave/count');

      cy.contains('count:0');
      cy.get('button').click();
      cy.contains('count:1');
    });
  });
});
