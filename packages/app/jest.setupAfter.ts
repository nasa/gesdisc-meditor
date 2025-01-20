import { connectionPromise } from './lib/mongodb'

afterAll(async () => {
    // close mongo connection after all tests run
    const client = await connectionPromise
    await client.disconnect()
})
