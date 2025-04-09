import React from "react"
import Hero from "./Hero"
import FeaturedNFTs from "./FeaturedNFTs"
import MintNFT from "./CreateCollection"
import TrendingNFTs from "./TrendingNFTs"
import FavoriteSlider from "./FavoriteSlider"

export default function Home() {
  // TODO: Replace with actual user address from your authentication system
  const userAddress = "0x83cbB78BC4F870651BfC8Dd898f2a43bc0553ac8"; // Replace this with the actual user's address

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-400">
      <FavoriteSlider address={userAddress} />
      <div className="container mx-auto px-4 py-8 space-y-12">
        <TrendingNFTs />
      </div>
    </div>
  )
}

