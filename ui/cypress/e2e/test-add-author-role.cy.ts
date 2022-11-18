const USERS_MODEL = 'Users'
const ALERTS_MODEL = 'Alerts'
const AUTHOR_UID = 'andyauthor'
const REVIEWER_UID = 'joereviewer'

describe('Test Adding Author Role To User', () => {
    it('user with permissions can add role author to user', () => {
        cy.task('db:seed:test-users', 'default')

        cy.login(REVIEWER_UID)

        cy.getMe().then(user => {
            // @ts-ignore
            cy.wrap(user).its('uid').should('eq', REVIEWER_UID)

            // intercept future /me requests to avoid the Earthdata redirect
            cy.server()
            cy.route({ url: '/me', response: user })

            // visit homepage
            cy.visit(Cypress.env('appUrl'))

            // find and visit user model
            cy.contains(new RegExp(`^${USERS_MODEL}`))
                .parent()
                .click()
            cy.url().should('contain', `/meditor/${USERS_MODEL}`)

            // find and visit user to modify
            cy.get('input[name="search"]').type(AUTHOR_UID)
            cy.get('[data-test="search-result-link"]').should('have.length', 1)
            cy.get('[data-test="search-result-link"]').click()
            cy.contains('button', 'Add another to Roles').click()

            cy.get('input[name="model"]').last().type(ALERTS_MODEL)
            cy.get('input[name="role"]').last().type('Author')

            // submit updates for user
            cy.contains('button', 'Save').click()
            cy.logout()
        })
    })

    it('user with newly added role can now create a document in model', () => {
        cy.login(AUTHOR_UID)

        cy.getMe().then(user => {
            // @ts-ignore
            cy.wrap(user).its('uid').should('eq', AUTHOR_UID)

            // intercept future /me requests to avoid the Earthdata redirect
            cy.server()
            cy.route({ url: '/me', response: user })

            // visit homepage
            cy.visit(Cypress.env('appUrl'))

            // navigate to model page, find new document, and approve it
            cy.contains(new RegExp(`^${ALERTS_MODEL}`))
                .parent()
                .click()
            cy.contains('button', 'Add New')
        })
    })

    it('removing permissions to author alerts from user', () => {
        cy.login(REVIEWER_UID)

        cy.getMe().then(user => {
            // @ts-ignore
            cy.wrap(user).its('uid').should('eq', REVIEWER_UID)

            // intercept future /me requests to avoid the Earthdata redirect
            cy.server()
            cy.route({ url: '/me', response: user })

            // visit homepage
            cy.visit(Cypress.env('appUrl'))

            // find and visit user model
            cy.contains(new RegExp(`^${USERS_MODEL}`))
                .parent()
                .click()
            cy.url().should('contain', `/meditor/${USERS_MODEL}`)

            // find and visit user to modify
            cy.get('input[name="search"]').type(AUTHOR_UID)
            cy.get('[data-test="search-result-link"]').should('have.length', 1)
            cy.get('[data-test="search-result-link"]').click()

            cy.get('.close-button').last().click({ force: true })

            // submit updates for user
            cy.contains('button', 'Save').click()
            cy.logout()
        })
    })

    it("user with removed role should not see 'Add New' button", () => {
        cy.login(AUTHOR_UID)

        cy.getMe().then(user => {
            // @ts-ignore
            cy.wrap(user).its('uid').should('eq', AUTHOR_UID)

            // intercept future /me requests to avoid the Earthdata redirect
            cy.server()
            cy.route({ url: '/me', response: user })

            // visit homepage
            cy.visit(Cypress.env('appUrl'))

            // navigate to model page, find new document, and approve it
            cy.contains(new RegExp(`^${ALERTS_MODEL}`))
                .parent()
                .click()
            cy.contains('button', 'Add New').should('not.exist')
        })
    })
})
