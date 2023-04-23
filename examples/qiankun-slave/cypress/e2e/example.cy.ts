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

  describe('MicroAppLink crossing multi apps', function () {
    it('jump between slave and slave-app2', () => {
      cy.visit('/slave/nav');

      cy.get('a[href*="hello"]').click();
      cy.contains('App2 HelloPage');

      cy.get('a[href*="nav"]').click();
      cy.contains('goto slave app2');
    });

    it('slave-app2 to master', () => {
      cy.visit('/animal/ant/hello');
      cy.get('a[href*="home"]').click();

      cy.contains('Qiankun Master Page');
    });
  });
});
