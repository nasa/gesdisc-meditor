const { ApolloServer } = require('apollo-server')
const { mEditorApi } = require('./lib/datasources')
const resolvers = require('./lib/resolvers')
const typeDefs = require('./lib/schema')
const directives = require('./lib/directives')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives: {
        date: directives.FormattableDateDirective,
    },
    dataSources: () => ({
        mEditorApi: new mEditorApi(),
    }),
    introspection: true,
    playground: true,
})

server.listen().then(({ url }) => {
    console.log(`🚀 GraphQL server ready at ${url}`)
})
