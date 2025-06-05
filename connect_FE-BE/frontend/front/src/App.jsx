import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios'
import './App.css'

function App() {
  const [jokes, setJokes] = useState([])

  useEffect(()=>{
    axios.get('/api/jokes')
    .then((Response)=>{
      setJokes(Response.data)
    })
    .catch((error)=>{
      console.log(error)
    })
  })

  return (
    <>
      <h1>Chai Aur Code</h1>
      <p>Jokes: {jokes.length}</p>
      {
        jokes.map((joke,index)=>(
          <div key={joke.id}>
          <h3>{joke.title}</h3>
          <h3>{joke.content}</h3>
          </div>
        ))
      }
    </>
  )
}

export default App
