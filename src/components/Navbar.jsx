import { Link } from "react-router-dom";
import { ThemeContext } from '../context/ThemeContext';
import { useContext } from 'react';
import React from 'react';

function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  return (
    <div data-theme={theme}>
      <nav>
        <div className="bg-amber-50 dark:bg-neutral-900 
        flex justify-between justify-items-center items-center place-items-center p-4 shadow-lg"> 
          
            <Link
              to="/"
              className="nav-link-custom"
            >
              Home
            </Link>
            <Link
              to="/search"
              className="nav-link-custom"
            >
              Search
            </Link>
            <Link
              to="/library"
              className="nav-link-custom"
            >
              Library
            </Link>
          <button
            onClick={toggleTheme}
            className="
              ml-4 p-2 rounded-md text-gray-800 dark:text-gray-200
              transition-all duration-300 ease-in-out
              hover:-translate-y-1
             
            "
           
          >
            {theme === 'light' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
