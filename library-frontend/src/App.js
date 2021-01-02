import React, { useEffect, useState } from 'react'
import { useApolloClient, useSubscription, useQuery } from '@apollo/client'
import Login from './components/Login'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { ALL_AUTHORS, ALL_BOOKS, USER, BOOK_ADDED } from './queries'

const Notify = ({errorMessage}) => {
  if ( !errorMessage ) {
    return null
  }
  return (
    <div style={{color: 'red'}}>
      {errorMessage}
    </div>
  )
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const user = useQuery(USER)
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const client = useApolloClient()
  
  useEffect(() => {
    setToken(window.localStorage.getItem('library-user-token'))
  }, [token])
  
  const updateCacheWith = (addedBook) => {
    const includeIn = (set, object) =>
      set.map(b => b.id).includes(object.id)
      
    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includeIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })
    }
  }
  
  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      console.log(addedBook)
      setErrorMessage(`${addedBook.title} added`)
      updateCacheWith(addedBook)
    }
  })
  
  
  if (authors.loading) {
    return <div>loading authors...</div>
  }
  
  if (books.loading) {
    return <div>loading books...</div>
  }
  
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>
        <Notify errorMessage={errorMessage} />
        
        <Login
          show={page === 'login'}
          setError={setErrorMessage}
          setToken={setToken}
        />
        
        <Authors
          show={page === 'authors'}
          authors={authors}
        />

        <Books
          show={page === 'books'}
          books={books}
        />
      </div>
    )
  }
  if (token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('add')}>add book</button>
          <button onClick={() => logout()}>logout</button>
        </div>
        
        <Notify errorMessage={errorMessage} />
  
        <Authors
          show={page === 'authors'}
          authors={authors}
        />
  
        <Books
          show={page === 'books'}
          books={books}
          user={user}
        />
  
        <NewBook
          show={page === 'add'}
          setError={setErrorMessage}
          updateCacheWith={updateCacheWith}
        />
  
      </div>
    )
  }
}

export default App