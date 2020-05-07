/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject> {
        /**
         * impersonate Meditor user by UID (only in DEV)
         * @example
         * cy.login('earthdatausername')
         */
        login(uid: string): Chainable<any>

        /**
         * logout of Meditor and Earthdata
         * @example
         * cy.logout()
         */
        logout(): Chainable<any>

        /**
         * returns currently logged in user
         * @example
         * cy.getMe()
         */
        getMe(): Chainable<any>

        /**
         * allows typing into CKEditor 
         * @example
         * cy.get('ck-editor').typeCKEditor('Hello world')
         */
        typeCKEditor(content: string): Chainable<any>

        /**
         * upload an image from fixtures directory
         * @example
         * cy.get('input').uploadImage('soil.png')
         */
        uploadImage(fileName: string): Chainable<any>
    }
}