"use client"

import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Link } from "react-router-dom"
import NFT_MARKETPLACE_ABI from "../constant/abi.json"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"

export default function FeaturedNFTs() {
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("eip155")

  const NFT_MARKETPLACE_ADDRESS = "0xF762a878921f173192b8E4F89A42E5797a523bdE"

  useEffect(() => {
    async function fetchCollections() {
      if (!isConnected || !walletProvider) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const provider = new ethers.BrowserProvider(walletProvider)
        const contract = new ethers.Contract(NFT_MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, provider)

        const collectionsData = await contract.getCollections()
        console.log("Raw collections data:", collectionsData)

        const formattedCollections = await Promise.all(
          collectionsData.map(async (collection) => {
            const baseCID = collection[4].replace("ipfs://", "").replace("/", "") // Ensure clean CID
            const maxSupply = String(collection[2])
            const tokenIds = collection[6].map((id) => String(id))
            const mintPrice = ethers.formatEther(collection[3])

            // Fetch metadata for the first available token to use as a preview image
            let previewImage = null
            let metadata = null
            if (tokenIds.length > 0) {
              const firstTokenId = tokenIds[0] // Get the first token's metadata
              const metadataUrl = `https://gateway.lighthouse.storage/ipfs/${baseCID}/${firstTokenId}.json`

              try {
                const response = await fetch(metadataUrl)
                metadata = await response.json()
                previewImage = metadata.image.replace("ipfs://", "https://gateway.lighthouse.storage/ipfs/")
              } catch (err) {
                console.error(`Error fetching metadata for token ${firstTokenId}:`, err)
              }
            }

            return {
              contractAddress: collection[0],
              name: collection[1],
              maxSupply,
              mintPrice,
              baseCID,
              totalMinted: String(collection[5]),
              tokenIds,
              previewImage,
              metadata,
              metadataBaseURI:`https://gateway.lighthouse.storage/ipfs/${baseCID}`
            }
          }),
        )

        setCollections(formattedCollections)
      } catch (error) {
        console.error("Error fetching collections:", error)
        setError("Failed to load collections. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollections()
  }, [isConnected, walletProvider])

  // Function to truncate address
  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3)
      .fill()
      .map((_, index) => (
        <div key={`skeleton-${index}`} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-5 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white dark:from-gray-900 to-gray-50 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Featured NFT Collections
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover unique digital assets created by talented artists from around the world
          </p>
        </div>

        {error && (
          <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg mb-8 max-w-2xl mx-auto animate-shake">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isConnected && !isLoading && (
          <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-8 max-w-2xl mx-auto animate-fade-in">
            <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">Connect Your Wallet</h3>
            <p className="text-blue-600 dark:text-blue-400 mb-4">Please connect your wallet to view available NFT collections</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {renderSkeletons()}
          </div>
        ) : collections.length === 0 && isConnected ? (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Collections Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              There are no NFT collections available at the moment. Check back later or create your own!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <Link
                key={index}
                to={`/collection/${collection.contractAddress}`}
                className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="card overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 transition-all duration-300 group-hover:shadow-xl">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={collection.previewImage || "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227724992-stock-illustration-image-available-icon-flat-vector.jpg"}
                      alt={collection.name}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227724992-stock-illustration-image-available-icon-flat-vector.jpg"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm font-medium">Mint Price</span>
                        <span className="text-lg font-bold">{collection.mintPrice} ETH</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {collection.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {collection.totalMinted} / {collection.maxSupply} minted
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 font-medium">
                        {truncateAddress(collection.contractAddress)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

