describe('template spec', () => {
  it('passes', () => {
    cy.visit('/foo/jsx-demo');
    cy.get('h2').contains('Jsx Demo');
    cy.get('.fn').contains('fn 123');
    cy.get('h3').contains('foo');
  });
});
