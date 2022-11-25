import { mongoClientPromise } from './lib/mongodb'

// mocks console so when we are testing expected output we don't pollute the Jest output
// TODO: after a logger is implemented, this should be removed in favor of using a mocking type solution
global.console = {
    ...console,
    error: jest.fn(),
    debug: jest.fn(),
}

process.env.DB_NAME = 'mock-meditor'

afterAll(async () => {
    // close mongo connection after all tests run
    const client = await mongoClientPromise
    client.close()
})
