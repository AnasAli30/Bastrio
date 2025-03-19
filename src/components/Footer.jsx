import React from "react"
import { Link } from "react-router-dom"

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 bg-background text-secondary border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    {...props}
  />
)

const Button = ({ children, className, ...props }) => (
  <button className={`px-4 py-2 rounded font-bold transition-colors ${className}`} {...props}>
    {children}
  </button>
)

export default function Footer() {
  return (
    <footer className="bg-background text-secondary py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-2 text-primary">Abstrio</h3>
            <p className="text-secondary">Discover, collect, and mint unique digital assets on Abstrio</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2 text-primary">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-secondary hover:text-primary">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-secondary hover:text-primary">
                  Create
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-secondary hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2 text-primary">Community</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-secondary hover:text-primary">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary hover:text-primary">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary hover:text-primary">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2 text-primary">Subscribe</h4>
            <p className="text-secondary mb-2">Stay updated with our latest drops and features</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="Your email" className="flex-grow" />
              <Button type="submit" className="bg-primary text-background hover:bg-opacity-80">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className="border-t border-primary mt-8 pt-8 text-center text-secondary">
          <p>&copy; 2025 Abstrio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

