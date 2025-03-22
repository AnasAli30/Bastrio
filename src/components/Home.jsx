import React from "react"
import Hero from "./Hero"
import FeaturedNFTs from "./FeaturedNFTs"
import MintNFT from "./CreateCollection"


export default function Home() {
  return (
    <div>
      <Hero />
   
      <section className="py-12 sm:py-20 bg-white">
        {/* <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Create Your NFT on Any Chain
          </h2>
        </div> */}
      </section>
    </div>
  )
}

