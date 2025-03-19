import React from "react"
import { Link } from "react-router-dom"

const Button = ({ children, className, ...props }) => (
  <button
    className={`px-6 py-3 rounded-full font-bold text-base sm:text-lg transition duration-300 ${className}`}
    {...props}
  >
    {children}
  </button>
)

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary to-background text-secondary py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Discover, Collect, and Mint Unique NFTs on Abstrio
        </h1>
        <p className="text-lg sm:text-xl mb-8">
          Explore the world of digital art and own a piece of the future with Abstrio on Abstract Chain
        </p>
        <Link to="/mint">
          <Button className="bg-secondary text-background hover:bg-opacity-80">Start Minting on Abstract Chain</Button>
        </Link>
      </div>
    </section>
  )
}

