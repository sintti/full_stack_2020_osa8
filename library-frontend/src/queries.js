import { gql } from '@apollo/client'

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      published
      author {
        name
        id
      }
      genres
      id
    }
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors{
      id
      name
      born
      bookCount
    }
  }
`

export const ALL_BOOKS = gql`
  query allBooks($genres: String){
    allBooks(genres: $genres){
      id
      title
      author {
        name
        id
      }
      published
      genres
    }
  }
`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $published: Int, $author: String!, $genres: [String!]) {
    addBook(
      title: $title,
      published: $published,
      author: $author,
      genres: $genres
    ) {
      title
      published
      author {
        name
        id
      }
      genres
      id
    }
  }
`

export const UPDATE_BORN = gql`
  mutation updateBorn($name: String!, $year: Int!) {
    editAuthor(name: $name, setBornTo: $year) {
      name
      born
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const USER = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`