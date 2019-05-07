describe('Edit-Review-Pxublish Workflow', () => {
	it('logs in as author', () => {
		cy.login('author')
		cy.createDocument('News')
	})
})
