/// <reference types="../support" />

const LoremIpsum = require("lorem-ipsum").LoremIpsum

const TEST_MODEL = 'News'
const AUTHOR_UID = 'andyauthor'
const REVIEWER_UID = 'joereviewer'
const PUBLISHER_UID = 'pattypublisher'

const lorem = new LoremIpsum()

describe('Edit-Review-Publish Workflow', () => {

	it('author can create a new document', () => {
		cy.login(AUTHOR_UID)

		cy.getMe().then(user => {
			// @ts-ignore
			cy.wrap(user).its('uid').should('eq', AUTHOR_UID)

			// intercept future /me requests to avoid the Earthdata redirect
			cy.server()
			cy.route({ url: '/me', response: user })

			// visit homepage
			cy.visit(Cypress.env('appUrl'))

			// find and visit model
			cy.contains(new RegExp(`^${TEST_MODEL}`)).parent().click()
			cy.url().should('contain', `search?model=${TEST_MODEL}`)

			// click create button
			cy.contains('button', 'Create').click()
			cy.url().should('contain', `new?model=${TEST_MODEL}`)

			// fill out required fields (with random title)
			cy.get('input[name="title"]').type(`Automated '${TEST_MODEL}' model test ${new Date().getTime()}`)
			cy.get('input[name="abstract"]').type(lorem.generateWords(5))
			cy.get('ck-editor').typeCKEditor(lorem.generateParagraphs(2))
			cy.get('material-image-widget input').uploadImage('soil.png')
			cy.get('input[name="imageCaption"]').type(lorem.generateWords(5))

			// submit new document, then submit it for review
			cy.contains('button', 'Save').click()
			cy.contains('button', 'Submit for review').click()

			cy.logout()
		})
	})

	it('reviewer can review/approve a document', () => {
		cy.login(REVIEWER_UID)

		cy.getMe().then(user => {
			// @ts-ignore
			cy.wrap(user).its('uid').should('eq', REVIEWER_UID)

			// intercept future /me requests to avoid the Earthdata redirect
			cy.server()
			cy.route({ url: '/me', response: user })

			// visit homepage
			cy.visit(Cypress.env('appUrl'))

			// navigate to model page, find new document, and approve it
			cy.contains(new RegExp(`^${TEST_MODEL}`)).parent().click()
			cy.get('med-search-result:first-child a').click()
			cy.get('mat-card-content mat-chip').should("contain", "Under Review")
			cy.contains('button', 'Approve publication').click()
		})
	})

	it('publisher can publish a document', () => {
		cy.login(PUBLISHER_UID)

		cy.getMe().then(user => {
			// @ts-ignore
			cy.wrap(user).its('uid').should('eq', PUBLISHER_UID)

			// intercept future /me requests to avoid the Earthdata redirect
			cy.server()
			cy.route({ url: '/me', response: user })

			// visit homepage
			cy.visit(Cypress.env('appUrl'))

			// navigate to model page, find new document, and approve it
			cy.contains(new RegExp(`^${TEST_MODEL}`)).parent().click()
			cy.get('med-search-result:first-child a').click()
			cy.get('mat-card-content mat-chip').should("contain", "Approved")
			cy.contains('button', 'Publish').click()
		})
	})

})
