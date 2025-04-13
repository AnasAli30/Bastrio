import React from "react"
// Uncomment these imports when ready to add these components to the home page
// import Hero from "./Hero"
// import FeaturedNFTs from "./FeaturedNFTs"
// import MintNFT from "./CreateCollection"
import TrendingNFTs from "./TrendingNFTs"
import FavoriteSlider from "./FavoriteSlider"

export default function Home() {
  // TODO: Replace with actual user address from your authentication system
  const userAddress = "0x83cbB78BC4F870651BfC8Dd898f2a43bc0553ac8"; // Replace this with the actual user's address

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 overflow-x-hidden">
      <main className="w-full">
        {/* Main content container with responsive padding */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 max-w-7xl">
          {/* Featured slider section */}
          <section className="pt-4 sm:pt-6 md:pt-8 lg:pt-10">
            <FavoriteSlider address={userAddress} />
          </section>
          
          {/* Trending NFTs section with responsive spacing */}
          <section className="pb-6 sm:pb-8 md:pb-12 lg:pb-16 pt-4 sm:pt-6 md:pt-8 lg:pt-10">
            <TrendingNFTs />
          </section>
          
          {/* Uncomment to add additional sections */}
          {/*
          <section className="py-6 sm:py-8 md:py-12 lg:py-16 border-t border-gray-200 dark:border-gray-800">
            <FeaturedNFTs />
          </section>
          
          <section className="py-6 sm:py-8 md:py-12 lg:py-16 border-t border-gray-200 dark:border-gray-800">
            <MintNFT />
          </section>
          */}
        </div>
      </main>
    </div>
  )
}

