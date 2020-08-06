import { makeExecutableSchema } from "graphql-tools";
import http from 'request-promise-json';

// Add the credential or API key
const MOVIE_DB_API_KEY = process.env.MOVIE_DB_API_KEY || 'ab129ef3b5937d18fbe7b425fcf6657f'

// Add this helper function to create a guest session
let guestSessionObj = null
async function getSessionId() {
    guestSessionObj = guestSessionObj || (await http.get(`https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${MOVIE_DB_API_KEY}&language=en-US`))
    console.log('Guest Session: ', guestSessionObj)
    return guestSessionObj["guest_session_id"]
}

const typeDefs = `
    type Query {
        movie(id: ID, imdb_id: String): Movie
        movies: [Movie]
        ratedMovies: [Movie]
    }

    type Mutation {
        rateMovie(id: ID!, rating: Int!): Movie
    }
    
    type Movie {
        id: ID
        budget(currency: Currency = EUR): Int
        title: String
        release_date: String
        overview: String
        popularity: Float
        vote_average: Float
        rating: Float
        production_companies: [Company]
    }

    type Company {
        id: Int
        logo_path: String
        name: String
        origin_country: String
    }

    enum Currency {
        EUR
        GBP
        USD
    }
`

const resolvers = {
    Query: {
        movie: async (obj, args, context, info) => {
            if (args.id) {
                return http.get(`https://api.themoviedb.org/3/movie/${args.id}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)
            }
            if (args.imdb_id) {
                const results = await http.get(`https://api.themoviedb.org/3/find/${args.imdb_id}?api_key=${MOVIE_DB_API_KEY}&language=en-US&external_source=imdb_id`)
                if (results.movie_results.length > 0) {
                    const movieId = results.movie_results[0].id
                    return http.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)
                }
            }
        },
        movies: async (obj, args, context, info) => {
            const discoverMoviesUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${MOVIE_DB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`
            const response = await http.get(discoverMoviesUrl)
            return response.results
        },
        ratedMovies: async (obj, args, context, info) => {
            const guest_session = await getSessionId()
            const ratedMoviesUrl = `https://api.themoviedb.org/3/guest_session/${guest_session}/rated/movies?api_key=${MOVIE_DB_API_KEY}&language=en-US`
            const response = await http.get(ratedMoviesUrl)
            return response.results
        }
    },
    Mutation: {
        rateMovie: async (obj, args, context, info) => {
            const guest_session = await getSessionId()
            return await http.post(
                `https://api.themoviedb.org/3/movie/${
                args.id
                }/rating?api_key=${MOVIE_DB_API_KEY}&guest_session_id=${guest_session}&language=en-US`,
                { value: args.rating }
            )
                .then(() => args.rating)
        }
    }
}

const schema = makeExecutableSchema(
    {
        typeDefs,
        resolvers
    }
)

export default schema