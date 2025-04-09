import React from "react"
import { Link } from "react-router-dom"

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="card p-8 md:p-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-light to-purple-600 dark:from-primary-dark dark:to-purple-400 bg-clip-text text-transparent">
            Discover, Collect, and Create Extraordinary NFTs
          </h1>
          <p className="text-lg md:text-xl text-text-light dark:text-text-dark opacity-90 mb-8">
            Join the future of digital collectibles. Create, buy, sell, and trade unique NFTs on multiple blockchains.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/explore" className="btn btn-primary">
              Explore Collections
            </Link>
            <Link to="/create" className="btn btn-secondary">
              Start Creating
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

