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
    <nav className="sticky top-0 z-50 bg-teal-900 dark:bg-teal-950 backdrop-blur-lg p-4 shadow-md border-b border-teal-50 dark:border-teal-700/50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left side: Links */}
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="nav-link-custom text-gray-300 hover:text-gray-100 font-medium"
          >
            Home
          </Link>
          <Link
            to="/search"
            className="nav-link-custom text-gray-300 hover:text-gray-100 font-medium"
          >
            Search
          </Link>
          <Link
            to="/library"
            className="nav-link-custom text-gray-300 hover:text-gray-100 font-medium"
          >
            Library
          </Link>
        </div>

        {/* Right side: Theme toggle and Auth */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:-translate-y-1 transition-all duration-300 ease-in-out"
          >
            {theme === 'light' ? '🌙' : '☀️'} {/* Corrected icons for clarity */}
          </button>
          {user ? (
            <>
              
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg font-semibold text-white bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
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
