import React from "react"

const featuredNFTs = [
  { id: 1, name: "Cosmic Harmony", artist: "Stella Nova", price: "0.5 ETH" },
  { id: 2, name: "Digital Dreams", artist: "Pixel Master", price: "0.8 ETH" },
  { id: 3, name: "Neon Nights", artist: "Glow Wizard", price: "0.6 ETH" },
  { id: 4, name: "Abstract Realms", artist: "Mindscape", price: "1.2 ETH" },
]

export default function FeaturedNFTs() {
  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Featured NFTs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuredNFTs.map((nft) => (
            <div
              key={nft.id}
              className="bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
            >
              <img
                src={`https://via.placeholder.com/300x300.png?text=${nft.name}`}
                alt={nft.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{nft.name}</h3>
                <p className="text-gray-600 mb-2">by {nft.artist}</p>
                <p className="text-purple-600 font-bold">{nft.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

