import React from "react"
import Hero from "./Hero"
import FeaturedNFTs from "./FeaturedNFTs"
import MintNFT from "./CreateCollection"


export default function Home() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-400">
      <div className="container mx-auto px-4 py-8 space-y-12">
        <Hero />
        <section className="card p-8">
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-6">
            Featured Collections
          </h2>
          <FeaturedNFTs />
        </section>
      </div>
    </div>
  )
}

