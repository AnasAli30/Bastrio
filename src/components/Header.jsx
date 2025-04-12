"use client"

import { getWeb3State } from "../utiles/getWeb3State"
import { useEffect, useState, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAppKitAccount } from "@reown/appkit/react"
import { useAppKitProvider } from "@reown/appkit/react"
import { useUserContext } from "../context/UserContext"
import ThemeToggle from "./ThemeToggle"

export default function Header() {
  const { userData } = useUserContext();
  const user = userData?.user;
  const { isConnected, address } = useAppKitAccount()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const profileRef = useRef(null)
  const location = useLocation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Close dropdowns when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [location.pathname])
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target) && 
          !event.target.closest('.menu-button')) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileOpen, isMenuOpen])
  
  // Handle escape key press to close menus
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
        setIsMenuOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header 
      className={`bg-surface-light dark:bg-surface-dark sticky top-0 z-50 transition-all duration-400
        ${scrolled ? 'shadow-md py-2' : 'py-3 sm:py-4'}`}
    >
      <nav className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl sm:text-2xl font-bold text-primary-light dark:text-primary-dark relative overflow-hidden group"
            aria-label="Bastrio Homepage"
          >
            <span className="inline-block transition-transform duration-300 group-hover:transform group-hover:-translate-y-full">
              Bastrio
            </span>
            <span className="absolute left-0 inline-block transition-transform duration-300 transform translate-y-full group-hover:transform group-hover:translate-y-0">
              Bastrio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
            <Link
              to="/explore"
              className={`text-sm lg:text-base py-1 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-light dark:after:bg-primary-dark after:transition-all hover:after:w-full ${location.pathname === '/explore' ? 'text-primary-light dark:text-primary-dark after:w-full' : ''}`}
              aria-current={location.pathname === '/explore' ? 'page' : undefined}
            >
              Drops
            </Link>
            <Link
              to="/trending"
              className={`text-sm lg:text-base py-1 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-light dark:after:bg-primary-dark after:transition-all hover:after:w-full ${location.pathname === '/trending' ? 'text-primary-light dark:text-primary-dark after:w-full' : ''}`}
              aria-current={location.pathname === '/trending' ? 'page' : undefined}
            >
              Heatmap
            </Link>
            <Link
              to="/create"
              className={`text-sm lg:text-base py-1 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-light dark:after:bg-primary-dark after:transition-all hover:after:w-full ${location.pathname === '/create' ? 'text-primary-light dark:text-primary-dark after:w-full' : ''}`}
              aria-current={location.pathname === '/create' ? 'page' : undefined}
            >
              Create
            </Link>

            {/* Theme Toggle and Wallet Connect */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <ThemeToggle />
              <div className="w-full max-w-[130px] lg:max-w-[150px]">
                <appkit-button />
              </div>

              {/* Profile Section - Only show when connected */}
              {isConnected && (
                <div className="relative profile-dropdown" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 rounded-full p-1"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                    aria-label="Profile menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                      {user?.image ? (
                        <img
                          src={user.image || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        address?.slice(2, 4).toUpperCase()
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl py-2 border border-gray-100 dark:border-gray-700 animate-fadeIn z-50"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">
                          {user?.id || formatAddress(address)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {formatAddress(address)}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                        role="menuitem"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/collections"
                        className="block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                        role="menuitem"
                      >
                        My Collections
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                        role="menuitem"
                      >
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => {
                            setIsProfileOpen(false)
                          }}
                          role="menuitem"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            
            {/* Show mini connect button on mobile */}
            {!isConnected && (
              <div className="w-full max-w-[100px]">
                <appkit-button />
              </div>
            )}
            
            {/* Profile button (mobile) */}
            {isConnected && (
              <Link 
                to="/profile"
                className="flex items-center space-x-1"
                aria-label="View profile"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium overflow-hidden">
                  {user?.image ? (
                    <img
                      src={user.image || "/placeholder.svg"}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    address?.slice(2, 4).toUpperCase()
                  )}
                </div>
              </Link>
            )}
            
            {/* Hamburger menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="menu-button text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark rounded-md p-1 transition-colors"
              aria-expanded={isMenuOpen}
              aria-label="Main menu"
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen 
              ? 'max-h-[500px] opacity-100 mt-4' 
              : 'max-h-0 opacity-0 mt-0'
          }`}
          ref={menuRef}
        >
          <div 
            className={`bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-transform duration-300 ${
              isMenuOpen ? 'translate-y-0' : '-translate-y-8'
            }`}
          >
            <Link
              to="/explore"
              className={`block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-4 transition-colors duration-200 ${
                location.pathname === '/explore' 
                  ? 'bg-gray-50 dark:bg-gray-800 text-primary-light dark:text-primary-dark font-medium' 
                  : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
              aria-current={location.pathname === '/explore' ? 'page' : undefined}
            >
              Drops
            </Link>
            <Link
              to="/trending"
              className={`block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-4 transition-colors duration-200 ${
                location.pathname === '/trending' 
                  ? 'bg-gray-50 dark:bg-gray-800 text-primary-light dark:text-primary-dark font-medium' 
                  : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
              aria-current={location.pathname === '/trending' ? 'page' : undefined}
            >
              Heatmap
            </Link>
            <Link
              to="/create"
              className={`block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-4 transition-colors duration-200 ${
                location.pathname === '/create' 
                  ? 'bg-gray-50 dark:bg-gray-800 text-primary-light dark:text-primary-dark font-medium' 
                  : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
              aria-current={location.pathname === '/create' ? 'page' : undefined}
            >
              Create
            </Link>

            {/* Mobile Wallet Connect - Only show if not already connected */}
            {!isConnected && (
              <div className="py-3 px-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Connect your wallet to access all features</p>
                <appkit-button />
              </div>
            )}

            {/* Mobile Profile Section */}
            {isConnected && (
              <div className="border-t border-gray-100 dark:border-gray-700 mt-2">
                <Link
                  to="/profile"
                  className="flex items-center py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium mr-3">
                    {user?.image ? (
                      <img
                        src={user.image || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      address?.slice(2, 4).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-light dark:text-text-dark">
                      {user?.username || 'My Profile'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatAddress(address)}
                    </p>
                  </div>
                </Link>
                <Link
                  to="/collections"
                  className="block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-4 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Collections
                </Link>
                <Link
                  to="/settings"
                  className="block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-4 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <div className="px-4 py-3">
                  <button
                    className="block w-full text-left py-2 px-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-md"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Add disconnect logic here
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
