const COMMAND_DELAY = 0

Cypress.Commands.add('logout', () => {
	// logout of URS
	cy.request({
		url: 'https://urs.earthdata.nasa.gov/logout',
		method: 'GET',
	}).then(res => {
		// logout of Meditor
		cy.request({
			url: '/logout',
			method: 'GET',
		})
	})
})

Cypress.Commands.add('login', uid => {
	cy.request({
		url: 'login',
		method: 'GET',
		qs: {
			impersonate: uid,
		}
	}).its('body')
})

Cypress.Commands.add('getMe', () => {
	cy.request({
		url: `/me`,
		method: 'GET',
	}).its('body')
})

Cypress.Commands.add('typeCKEditor', (content) => {
	// TODO: support multiple ckeditor instances by using get()
	cy.window().then(win => {
		let keys = Object.keys(win.CKEDITOR.instances)
		win.CKEDITOR.instances[keys[0]].setData(content)
	})
})

function getFixtureBlob(fileUrl, type) {
	return type === 'application/json'
		? cy.fixture(fileUrl)
			.then(JSON.stringify)
			.then(jsonStr => new Blob([jsonStr], { type: 'application/json' }))
		: cy.fixture(fileUrl, 'base64')
			.then(Cypress.Blob.base64StringToBlob)

}

Cypress.Commands.add('uploadImage', { prevSubject: 'element' }, (subject, imageName, type = 'image/png') => {
	return getFixtureBlob(imageName, type).then(blob => {
		const el = subject[0]
		const imageFile = new File([blob], imageName, { type })
		const dataTransfer = new DataTransfer()

		dataTransfer.items.add(imageFile)
		el.files = dataTransfer.files

		// have to emulate a user actually uploading
		var event = document.createEvent('UIEvents')
		event.initUIEvent("change", true, true)
		el.dispatchEvent(event)
	})
})

for (const command of ['visit', 'click', 'trigger', 'type', 'clear', 'reload', 'contains']) {
	Cypress.Commands.overwrite(command, (originalFn, ...args) => {
		const origVal = originalFn(...args)

		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(origVal)
			}, COMMAND_DELAY)
		})
	})
} 