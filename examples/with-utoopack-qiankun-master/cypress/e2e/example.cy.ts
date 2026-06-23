/// <reference types="cypress" />

describe('Utoopack Qiankun Plugin', () => {
  it('can load an utoopack slave app through qiankun 2', () => {
    cy.request('http://127.0.0.1:5555/@example/with-utoopack-qiankun-slave/');
    cy.visit('/');
    cy.contains('Utoopack Qiankun Master Page');

    cy.get('a[href="/slave"]').click();
    cy.contains('Utoopack with Qiankun Slave');
  });
});
