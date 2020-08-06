import { makeExecutableSchema } from "graphql-tools";

const filter = (data, conditions) => {
    const fields = Object.keys(conditions)
    return data.filter(obj => {
        return fields.filter(key => obj[key] === conditions[key]).length === fields.length
    })
}

const find = (data, conditions) => {
    return filter(data, conditions)[0]
}

// example data
const authors = [
    { id: 1, firstName: 'Tom', lastName: 'Coleman' },
    { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
    { id: 3, firstName: 'Mikhail', lastName: 'Novikov' }
]

const posts = [
    { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
    { id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3 },
    { id: 3, authorId: 3, title: 'Advanced GraphQL', votes: 1 },
    { id: 4, authorId: 4, title: 'Launchpad is Cool', votes: 7 }
]

const typeDefs = `
    type Author {
        id: Int!
        firstName: String
        lastName: String
        """
        the list of Posts by this author 
        """
        posts: [Post]
    }

    type Post {
        id: Int!
        title: String
        author: Author
        votes: Int
    }

    # the schema allows the following query:
    type Query {
        posts: [Post]
        author(id: Int!): Author
    }

    # the schema allows the following mutation:
    type Mutation {
        upvotePost(postId: Int!): Post
    }
`

// Resolvers tell the Apollo server how to find all the data.
const resolvers = {
    Query: {
        posts: () => posts,
        author: (_, { id }) => find(authors, { id: id })
    },
    Mutation: {
        upvotePost: (_, { postId }) => {
            const post = find(posts, { id: postId })
            if (!post) {
                // post is not found
                throw new Error(`Couldn't find post with id ${postId}`);
            }
            post.votes += 1
            return post
        }
    },
    Author: {
        posts: (author) => filter(posts, { authorId: author.id })
    },
    Post: {
        author: (post) => find(authors, { id: post.authorId })
    }
}

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

export default schema