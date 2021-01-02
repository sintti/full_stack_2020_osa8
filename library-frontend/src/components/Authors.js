import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { UPDATE_BORN } from '../queries'

const Authors = ({ show, authors, token }) => {
  const [year, setYear] = useState('')
  const [name, setName] = useState('')
  const [ updateBorn ] = useMutation(UPDATE_BORN)
  
  if (!show || authors.loading) {
    return null
  }
  
  const submitBirthyear = (e) => {
    e.preventDefault()
    console.log('birthyear')
    
    updateBorn({ variables: { name, year } })
    
    setName('')
    setYear('')
  }
  
  if (!token) {
    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>
                born
              </th>
              <th>
                books
              </th>
            </tr>
            {authors.data.allAuthors.map(a =>
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.data.allAuthors.map(a =>
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={submitBirthyear}>
        <div>
          name
          <select 
            defaultValue={name}
            onChange={setName}
          >
            {authors.data.allAuthors.map(a => 
              <option key={a.id}>{a.name}</option>
            )}
          </select>
        </div>
        <div>
          year <input
            type='number'
            value={year} 
            onChange={({ target }) => setYear(Number(target.value))}
            />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors
