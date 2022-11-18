/// <reference types="../support" />

// @ts-nocheck

const LoremIpsum = require('lorem-ipsum').LoremIpsum

const TEST_MODEL = 'Cypress Example News'
const AUTHOR_UID = 'andyauthor'
const REVIEWER_UID = 'ralphreviewer'
const PUBLISHER_UID = 'pattypublisher'

const lorem = new LoremIpsum()

describe('Edit-Review-Publish Workflow', () => {
    it('author can create a new document', () => {
        cy.task('db:seed', 'default')

        cy.login(AUTHOR_UID)

        cy.getMe().then(user => {
            cy.wrap(user).its('uid').should('eq', AUTHOR_UID)

            // intercept future /me requests to avoid the Earthdata redirect
            cy.server()
            cy.route({ url: '/me', response: user })

            // visit homepage
            cy.visit(Cypress.env('appUrl'))

            // find and visit model
            cy.contains(new RegExp(`^${TEST_MODEL}`))
                .parent()
                .click()

            cy.url().should('contain', `/${encodeURIComponent(TEST_MODEL)}`)

            // click create button
            cy.contains('button', 'Create').click()

            cy.url().should('contain', `/${encodeURIComponent(TEST_MODEL)}/new`)

            // fill out required fields (with random title)
            cy.get('input[id="root_title"]').type(
                `Automated '${TEST_MODEL}' model test ${new Date().getTime()}`
            )
            cy.get('input[id="root_abstract"]').type(lorem.generateWords(5))
            cy.get('div[id="cke_editor1"]').typeCKEditor(lorem.generateParagraphs(2))
            cy.get('input[type="file"]').uploadImage('soil.png')
            cy.get('input[id="root_imageCaption"]').type(lorem.generateWords(5))

            // attempt to save and make sure it didn't fail to save due to validation errors
            cy.contains('button', 'Save').click()
            cy.get('.panel-danger').should('not.exist')

            // submit it for review
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
            cy.contains(new RegExp(`^${TEST_MODEL}`))
                .parent()
                .click()
            cy.get('div[class^="search-result_result"] a').first().click()
            cy.get('span[class^="state-badge_badge"]').should(
                'contain',
                'Under Review'
            )
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
            cy.contains(new RegExp(`^${TEST_MODEL}`))
                .parent()
                .click()
            cy.get('div[class^="search-result_result"] a').first().click()
            cy.get('span[class^="state-badge_badge"]').should('contain', 'Approved')
            cy.contains('button', 'Publish').click()
        })
    })
})
