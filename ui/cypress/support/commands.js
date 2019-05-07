function createUser(uid, firstName, lastName, emailAddress, roles) {
	return {
		_id: '5bfd878f679c5578deb07a26',
		created: 1543341967899,
		lastAccessed: 1543341967881,
		middleInitial: null,
		studyArea: null,
		uid,
		emailAddress,
		firstName,
		lastName,
		roles,
	}
}

Cypress.Commands.add('login', userType => {
	let types = {
		author: createUser('author', 'Author', 'Author', 'author@fakedomain.com', [{ model: 'News', role: 'Author' }]),
	}

	const mockUser = types[userType]

	cy.request({
		url: `/login`,
		method: 'GET',
		qs: {
			mockUser,
		},
	})
		.its('body')
		.then(body => {
			console.log(body)
		})
})

Cypress.Commands.add('getMe', () => {
	cy.request({
		url: `/me`,
		method: 'GET',
	})
		.its('body')
		.then(body => {
			console.log(body)
		})
})

Cypress.Commands.add('createDocument', () => {
	cy.request({
		url: '/putDocument',
		method: 'POST',
		headers: {
			'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryg6SBy3mWLvHZpQje',
		},
		body:
			'------WebKitFormBoundaryg6SBy3mWLvHZpQje\r\nContent-Disposition: form-data; name="file"; filename="blob"\r\nContent-Type: application/octet-stream\r\n\r\n{"title":"News Item 12345","abstract":"Automated testing news item","type":"News","image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=","imageCaption":"Caption","body":"<p>Lorem ipsum</p>\\n","x-meditor":{"model":"News"}}\r\n------WebKitFormBoundaryg6SBy3mWLvHZpQje--\r\n',
	})
})
