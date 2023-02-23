/// <reference types="cypress" />

describe('Basic Test', () => {
  it('can render all customized route Props', async () => {
    cy.visit('/');

    const propsString = await new Promise<string>((resolve) => {
      cy.get('.routeProps').invoke('text').then(resolve);
    });

    expect(JSON.parse(propsString)).to.deep.contains({
      name: 'IndexMenuName',
      a: 1,
      d: { a: 1, b: '2' },
    });
  });

  it('can menuRender false hide menu', () => {
    cy.visit('/');

    cy.get('.routeProps');
    cy.get('aside').should('not.exist');
  });

  it('can render icon', () => {
    cy.visit('/demo');

    cy.contains('Demo Page');

    cy.get('svg[data-icon="home"]').should('exist');
  });

  it('can render route name on layout', () => {
    cy.visit('/demo');

    cy.contains('Demo Page');

    cy.get('.ant-menu-item').contains('DemoMenuName');
  });

  it('can hideInMenu work', () => {
    cy.visit('/demo');
    cy.contains('Demo Page');

    cy.get('.ant-menu-item').should('not.contain', 'IndexMenuName');
  });

  it('can render icon', () => {
    cy.visit('/demo');
    cy.contains('Demo Page');

    cy.get('svg[data-icon="home"]').should('exist');
  });

  it('can access work', () => {
    cy.visit('/notAccessable');
    cy.contains('抱歉，你无权访问该页面');
  });
});
