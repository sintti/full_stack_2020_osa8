const { ApolloServer, gql, UserInputError, AuthenticationError, PubSub } = require('apollo-server')
const mongoose = require('mongoose')
const DataLoader =  require('dataloader')
const jwt = require('jsonwebtoken')
const config = require('./utils/config')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const pubsub = new PubSub()
 
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })
 
 
const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]
  }
  type Author {
    name: String!
    born: Int
    bookCount: Int
    books: [Book!]
    id: ID! 
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(genres: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
  type Mutation {
    addBook(
      title: String!
      published: Int
      author: String!
      genres: [String!]
    ): Book
    addAuthor(
      name: String!
      born: Int
    ): Author
    editAuthor(
      name: String!,
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
  type Subscription {
    bookAdded: Book!
  }
`

// const bookCountLoader = new DataLoader(author => {
//   return Book.find( { author: { $in: [ author ] } } ).then(books => {
//     const booksByAuthor = _.keyBy(books, "author")
//     return author.map(au => booksByAuthor[au])
//   })
// })
 
const resolvers = {
  Query: {
    bookCount: () => {
      console.log('bookcount')
      return Book.collection.countDocuments()
    },
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
      if (!args.genres) {
        return Book.find({}).populate('author')
      }
      return Book.find({  genres: { $in: [ args.genres ] } } ).populate('author')
    },
    allAuthors: (root, args) => {
      console.log('Author.find')
      return Author.find({}).populate('books')
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: (root) => {
      console.log('pieru', root)
      return root.books.length
    }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not autheticated')
      }
      let existingAuthor = await Author.findOne({ name: args.author })
      if (!existingAuthor) {
        const newAuthor = new Author({ name: args.author, born: undefined })
        existingAuthor = await newAuthor.save()
      }
      const book = new Book({ ...args, author: existingAuthor })
      
      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      
      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      
      return book
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args })
      
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      
      return author
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not autheticated')
      }
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    },
    createUser: (root, args) => {
      const user = new User({ 
        username: args.username, 
        favoriteGenre: args.favoriteGenre 
      })
      
      return user.save()
        .catch(e => {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      
      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials')
      }
      
      const userForToken = {
        username: user.username,
        id: user._id
      }
      
      return { value: jwt.sign(userForToken, config.JWT_SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}
 
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), config.JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  }
})
 
server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`),
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})