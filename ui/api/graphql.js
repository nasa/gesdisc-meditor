const { ApolloServer } = require('apollo-server')
const responseCachePlugin = require('apollo-server-plugin-response-cache')
const { mEditorApi } = require('./lib/datasources')
const resolvers = require('./lib/resolvers')
const typeDefs = require('./lib/schema')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        mEditorApi: new mEditorApi(),
    }),
    plugins: [
        responseCachePlugin(),
    ]
})

server.listen().then(({ url }) => {
    console.log(`🚀 GraphQL server ready at ${url}`)
})
