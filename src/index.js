import koa from "koa";
import koaRouter from "koa-router";
import koaBodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { graphqlKoa, graphiqlKoa } from "apollo-server-koa";
// import schema from "./schema/example"
import schema from "./schema/movie"

const app = new koa();
const router = new koaRouter();
const PORT = process.env.PORT || 3001

console.clear()
console.log(
    '   :{) Welcome!\n',
    '   ----------------------------------\n'
)

// Set up the GraphQL API server routes with the schema
router.post('/graphql', koaBodyParser(), graphqlKoa({ schema }))
router.get('/graphql', graphqlKoa({ schema }))

// Set up the GraphiQL route to show the GraphiQL UI
router.get('/graphiql', graphiqlKoa({
    endpointURL: '/graphql',
    // passHeader: `'Authorization': 'Bearer <test token>'`
}))

// You must enable CORS before any other app.use calls
// The data in your requests will not be usable before they are handled by the cors middleware.
app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`
    console.log(
        `   GraphQL server started on:\n   ${url}\n\n`,
        `➜ Open ${url}/graphiql to\n   start querying your API.\n\n`,
        `➜ Point your GraphQL client apps to\n   ${url}/graphql\n`,
        ' ---------------------------------------\n'
    )
})