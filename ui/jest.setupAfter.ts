import mongoClient from './lib/mongodb'

process.env.DB_NAME = 'mock-meditor'

afterAll(async () => {
    // close mongo connection after all tests run
    const client = await mongoClient
    client.close()
})
