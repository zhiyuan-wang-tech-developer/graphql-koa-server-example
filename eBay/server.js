import 'reflect-metadata'
import * as Koa from 'koa'
import * as koaBodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { useKoaServer } from 'routing-controllers'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import schema from './schema'   // GraphQL schema!

const PORT = process.env.PORT || 3030
const app = new Koa()
const router = new Router()

router.get('/', async (ctx, next) => {
    ctx.body = 'It works!'
    await next()
})

// Set up 2 GraphQL routes (POST and GET) on /graphql
router.post('/graphql', koaBodyParser(), async (ctx, next) => {
    await graphqlKoa({ schema, context: ctx })(ctx, next)
})

router.get('/graphql', async (ctx, next) => {
    await graphqlKoa({ schema, context: ctx })(ctx, next)
})

// Enable GraphiQL to explore schema, mutation and query
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

app.use(requestLogger)
    .use(router.routes())
    .use(router.allowedMethods())

useKoaServer(app, {
    controllers: []
})

connect().then(() => {
    app.listen(PORT, () => logger('app').info(`API is listening on port ${PORT}`))
})