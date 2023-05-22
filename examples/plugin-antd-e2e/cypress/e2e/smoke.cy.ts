/// <reference types="cypress" />

describe('Basic Test', () => {
  before(() =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Network.setCacheDisabled',
      params: { cacheDisabled: true },
    }),
  );

  it('momentjs replacement is working', () => {
    cy.visit('/');

    cy.get<HTMLInputElement>('.ant-picker-input input').should(
      'have.value',
      '2022-01-01',
    );
  });

  it('static theme passed is working', () => {
    cy.visit('/');

    cy.contains('Confirm Me').click();

    cy.wait(500);

    cy.get('.ant-modal-confirm-btns .ant-btn-primary').should(
      'have.css',
      'border-radius',
      '2px',
    );
  });
});
