import { connectToNats } from './nats'

await connectToNats()

export { connectToNats }
export * from './mongodb'
