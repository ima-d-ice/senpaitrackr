import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; // Adjust path if necessary
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  

  return (
    
    <div data-theme = {theme} >
    <nav className="bg-amber-50 dark:bg-neutral-900 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left side: Links */}
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="nav-link-custom text-gray-800 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400"
          >
            Home
          </Link>
          <Link
            to="/search"
            className="nav-link-custom text-gray-800 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400"
          >
            Search
          </Link>
          <Link
            to="/library"
            className="nav-link-custom text-gray-800 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400"
          >
            Library
          </Link>
        </div>

        {/* Right side: Theme toggle and Auth */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-800 dark:text-gray-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {theme === 'light' ? '🌙' : '☀️'} {/* Corrected icons for clarity */}
          </button>
          {user ? (
            <>
              
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-2 rounded-lg font-semibold text-white bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors duration-300 text-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  </div>
  );
};

export default Navbar;
