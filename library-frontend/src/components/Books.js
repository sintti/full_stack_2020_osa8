import { useLazyQuery } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { ALL_BOOKS } from '../queries'

const Books = ({ show, books, user }) => {
  const [genre, setGenre] = useState(null)
  const [getBooksByGenre, result] = useLazyQuery(ALL_BOOKS)
  const bookList = books.data.allBooks.map(b => b)
  
  useEffect(() => {
    getBooksByGenre({ variables: { genres: genre } })
  }, [genre]) // eslint-disable-line
  
  if (!show || books.loading) {
    return null
  }
  
  if (result.loading) {
    return <div>loading stuff</div>
  }
  
  if (!genre) {
    return (
      <div>
        <h2>books</h2>
        <button onClick={() => setGenre(user.data.me.favoriteGenre)}>recommend books</button>
        <table>
          <tbody>
            <tr>
              <th>
                title
              </th>
              <th>
                author
              </th>
              <th>
                published
              </th>
            </tr>
            {bookList.map(b =>
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            )}
          </tbody>
        </table>
        <button onClick={() => setGenre(null)}>Clear genre</button>
        {bookList.map(b => (
          b.genres.map(g => (
            <button key={g} onClick={() => setGenre(g)}>{g}</button>
          ))
        ))}
      </div>
    )
  }
  
  if (result) {
    return (
      <div>
        <h2>books</h2>
        <button onClick={() => setGenre(null)}>clear genre</button>
        <table>
          <tbody>
            <tr>
              <th>
                title
              </th>
              <th>
                author
              </th>
              <th>
                published
              </th>
            </tr>
            {result.data.allBooks.map(b => 
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Books