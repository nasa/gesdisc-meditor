import { mongoClientPromise } from './lib/mongodb'

// mocks console so when we are testing expected output we don't pollute the Jest output
global.console = {
    ...console,
    error: jest.fn(),
    log: jest.fn(),
}

process.env.DB_NAME = 'mock-meditor'

afterAll(async () => {
    // close mongo connection after all tests run
    const client = await mongoClientPromise
    client.close()
})
