import { mongoClientPromise } from './lib/mongodb'

global.console = {
    ...console,
    error: jest.fn(), // mocks console.error so when we are testing expected errors we don't pollute the Jest output
}

process.env.DB_NAME = 'mock-meditor'

afterAll(async () => {
    // close mongo connection after all tests run
    const client = await mongoClientPromise
    client.close()
})
