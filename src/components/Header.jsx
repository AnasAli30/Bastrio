import React, { useState } from "react"
import { Link } from "react-router-dom"

const Button = ({ onClick, children, className }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded font-bold transition-colors ${className}`}>
    {children}
  </button>
)

const Wallet = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </svg>
)

const Menu = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
)

const X = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

export default function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const connectWallet = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsConnected(true)
      setAddress("0x1234...5678")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  return (
    <header className="bg-background shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Abstrio
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/explore" className="text-secondary hover:text-primary">
              Explore
            </Link>
            <Link to="/create" className="text-secondary hover:text-primary">
              Create
            </Link>
            <Button onClick={connectWallet} className="bg-primary text-background hover:bg-opacity-80">
              <span className="flex items-center">
                <Wallet />
                <span className="ml-2">
                  {isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
                </span>
              </span>
            </Button>
          </div>
          <div className="md:hidden">
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-primary hover:text-opacity-80">
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            <Link to="/explore" className="block py-2 text-secondary hover:text-primary">
              Explore
            </Link>
            <Link to="/create" className="block py-2 text-secondary hover:text-primary">
              Create
            </Link>
            <Button onClick={connectWallet} className="w-full mt-2 bg-primary text-background hover:bg-opacity-80">
              <span className="flex items-center justify-center">
                <Wallet />
                <span className="ml-2">
                  {isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
                </span>
              </span>
            </Button>
          </div>
        )}
      </nav>
    </header>
  )
}

