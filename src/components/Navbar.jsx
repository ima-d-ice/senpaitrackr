import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; // Adjust path if necessary
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
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
      setIsMobileMenuOpen(false); // Close menu on sign out
      navigate("/login"); // Redirect to login page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Function to close the mobile menu, e.g., when a link is clicked
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  

  return (
    
    <div data-theme = {theme} >
    <nav className="sticky top-0 z-50 bg-teal-900 dark:bg-teal-950 backdrop-blur-lg p-4 shadow-md border-b border-teal-50 dark:border-teal-700/50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Brand/Logo */}
        <Link to="/" className="text-xl font-bold text-gray-100 hover:text-white" onClick={closeMobileMenu}>
          SenpaiTrackr
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
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
          {/* Theme Toggle and Auth for Desktop */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-300 hover:text-white transition-colors duration-300" // Adjusted classes
          >
            {theme === 'light' ? '🌙' : '☀️'}
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

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> // X icon
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /> // Hamburger icon
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'max-h-screen opacity-100 pt-2 pb-3' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="space-y-1"> {/* Inner container for padding when open */}
          <Link to="/" className="block nav-link-custom text-gray-300 hover:text-gray-100 hover:bg-teal-800 dark:hover:bg-teal-900 px-3 py-2 rounded-md font-medium" onClick={closeMobileMenu}>Home</Link>
          <Link to="/search" className="block nav-link-custom text-gray-300 hover:text-gray-100 hover:bg-teal-800 dark:hover:bg-teal-900 px-3 py-2 rounded-md font-medium" onClick={closeMobileMenu}>Search</Link>
          <Link to="/library" className="block nav-link-custom text-gray-300 hover:text-gray-100 hover:bg-teal-800 dark:hover:bg-teal-900 px-3 py-2 rounded-md font-medium" onClick={closeMobileMenu}>Library</Link>
          
          <div className="pt-2 mt-2 border-t border-teal-700 dark:border-teal-800">
            <button
              onClick={() => { toggleTheme(); closeMobileMenu(); }}
              className="w-full text-left block px-3 py-2 rounded-md text-gray-300 hover:text-gray-100 hover:bg-teal-800 dark:hover:bg-teal-900 font-medium"
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode ({theme === 'light' ? '🌙' : '☀️'})
            </button>
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full text-left block mt-1 px-3 py-2 rounded-md font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors duration-300"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block mt-1 px-3 py-2 rounded-md font-semibold text-white bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors duration-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  </div>
  );
};

export default Navbar;
