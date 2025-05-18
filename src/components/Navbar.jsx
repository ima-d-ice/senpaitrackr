import { Link } from "react-router-dom";
import { ThemeContext } from '../context/ThemeContext';

import { useContext } from 'react';

import React from 'react'

function Navbar() {
  const {theme,setTheme} = useContext(ThemeContext);
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }
  return (
    <div data-theme = {theme}>
      <nav className="bg-gray-100 dark:bg-gray-900 p-4 shadow-md text-gray-900 dark:text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4 text-lg font-medium">
          <Link to="/" className="hover:text-teal-500 dark:hover:text-teal-300 transition-colors duration-200">Home</Link>
          <Link to="/search" className="hover:text-teal-500 dark:hover:text-teal-300 transition-colors duration-200">Search</Link>
          <Link to="/library" className="hover:text-teal-500 dark:hover:text-teal-300 transition-colors duration-200">Library</Link>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-2xl"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  </div>
  )
}

export default Navbar
