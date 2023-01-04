import { mongoClientPromise } from './lib/mongodb'

afterAll(async () => {
    // close mongo connection after all tests run
    const client = await mongoClientPromise
    client.close()
})
