// DOCS: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { connectToNats } = await import('./lib/nats')

        await connectToNats()
    }
}
