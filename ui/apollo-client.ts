import { ApolloClient } from 'apollo-client'
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import fetch from 'isomorphic-unfetch'

export default function createApolloClient(initialState, ctx) {
    // The `ctx` (NextPageContext) will only be present on the server.
    // use it to extract auth headers (ctx.req) or similar.
    return new ApolloClient({
        ssrMode: Boolean(ctx),
        link: new HttpLink({
            uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
            fetch,
        }),
        cache: new InMemoryCache({
            dataIdFromObject: object => {
                switch(object.__typename) {
                    //@ts-ignore
                    case 'Model': return object.name
                    //@ts-ignore
                    case 'Document': return object.title
                    default: return defaultDataIdFromObject(object)
                }
            },
        }).restore(initialState),
    })
}
