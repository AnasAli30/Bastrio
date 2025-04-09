"use client"

import { getWeb3State } from "../utiles/getWeb3State"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest(".profile-dropdown")) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileOpen])

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="bg-surface-light dark:bg-surface-dark shadow-md sticky top-0 z-50 transition-colors duration-400">
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-light dark:text-primary-dark relative overflow-hidden group">
            <span className="inline-block transition-transform duration-300 group-hover:transform group-hover:-translate-y-full">
              Bastrio
            </span>
            <span className="absolute left-0 inline-block transition-transform duration-300 transform translate-y-full group-hover:transform group-hover:translate-y-0">
              Bastrio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/explore"
              className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-light dark:after:bg-primary-dark after:transition-all hover:after:w-full"
            >
              Drops
            </Link>
            <Link
              to="/trending"
              className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-light dark:after:bg-primary-dark after:transition-all hover:after:w-full"
            >
              Heatmap
            </Link>
            <Link
              to="/create"
              className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-light dark:after:bg-primary-dark after:transition-all hover:after:w-full"
            >
              Create
            </Link>

            {/* Theme Toggle and Wallet Connect */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <appkit-button />

              {/* Profile Section - Only show when connected */}
              {isConnected && (
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 rounded-full p-1 pr-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                      {user?.image ? (
                        <img
                          src={user.image || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        address?.slice(2, 4).toUpperCase()
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl py-2 z-10 border border-gray-100 dark:border-gray-700 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{user?.id || "My Account"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{formatAddress(address)}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/collections"
                        className="block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        My Collections
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => {
                            setIsProfileOpen(false)
                          }}
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
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        {isMenuOpen && (
          <div className="mt-4 md:hidden animate-slideDown bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
            <Link
              to="/explore"
              className="block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-3 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Drops
            </Link>
            <Link
              to="/trending"
              className="block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-3 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Trending
            </Link>
            <Link
              to="/create"
              className="block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-3 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Create
            </Link>

            {/* Mobile Wallet Connect */}
            <div className="py-3 px-3">
              <appkit-button />
            </div>

            {/* Mobile Profile Section */}
            {isConnected && (
              <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                <Link
                  to="/profile"
                  className="flex items-center py-3 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium mr-3">
                    {user?.image ? (
                      <img
                        src={user.image || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      address?.slice(2, 4).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-light dark:text-text-dark">{user?.id || "My Profile"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatAddress(address)}</p>
                  </div>
                </Link>
                <Link
                  to="/collections"
                  className="block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-3 rounded-md transition-colors duration-200 ml-11"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Collections
                </Link>
                <Link
                  to="/settings"
                  className="block py-3 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 px-3 rounded-md transition-colors duration-200 ml-11"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

