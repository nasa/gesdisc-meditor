const express = require('express')
const cookieParser = require('cookie-parser')
const { ApolloServer } = require('apollo-server-express')
const { mEditorApi } = require('./lib/datasources')
const resolvers = require('./lib/resolvers')
const typeDefs = require('./lib/schema')
const directives = require('./lib/directives')

const app = express()

app.use(cookieParser())

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
    context: async ({ req }) => {
        return { cookies: req.cookies }
    }
})

server.applyMiddleware({ app, path: '/' })

app.listen({ port: 4000 }, () =>
  console.log(`🚀 GraphQL server ready at http://localhost:4000${server.graphqlPath}`)
)
