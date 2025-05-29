import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import AnimeDetails from './pages/AnimeDetails'
import Navbar from './components/Navbar'
import Auth from './components/auth'; // Import the Auth component

function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/search' element={<Search />} />
        <Route path='/library' element={<Library />} />
        <Route path='/anime/:id' element={<AnimeDetails />} />
        <Route path='/login' element={<Auth />} /> {/* Add this route */}
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Routes>
    </HashRouter>
  )
}

export default App