import { defaultDataIdFromObject, InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import fetch from 'isomorphic-unfetch'

export default function createApolloClient(initialState, ctx) {
    let uri = 'http://meditor_ui:4000'

    if (typeof window !== 'undefined') {
        uri = window.location.origin + '/meditor/graphql'
    } else if (
        process.env.APP_URL &&
        process.env.APP_URL.indexOf('uat.gesdisc.eosdis.nasa.gov') >= 0
    ) {
        uri = 'http://meditor_test_ui:4000'
    }

    // The `ctx` (NextPageContext) will only be present on the server.
    // use it to extract auth headers (ctx.req) or similar.
    return new ApolloClient({
        ssrMode: Boolean(ctx),
        link: new HttpLink({
            uri,
            fetch,
            credentials: 'include',
        }),
        cache: new InMemoryCache({
            dataIdFromObject: object => {
                switch (object.__typename) {
                    case 'Model':
                        //@ts-ignore
                        return object.name
                    case 'Document':
                        //@ts-ignore
                        return object.title
                    default:
                        return defaultDataIdFromObject(object)
                }
            },
        }).restore(initialState),
    })
}
