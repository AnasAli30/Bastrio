"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNavigate } from "react-router-dom"
import NFT_MARKETPLACE_ABI from "../constant/abi.json"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"

export default function FeaturedNFTs() {
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("eip155")
  const navigate = useNavigate()

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

  // Function to handle card click
  const handleCardClick = (collection) => {
    navigate(`/collection/${collection.contractAddress}`, { state: { collection } })
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
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured NFT Collections</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover unique digital assets created by talented artists from around the world
          </p>
        </div>

        {error && (
          <div className="text-center p-6 bg-red-50 rounded-lg mb-8 max-w-2xl mx-auto">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isConnected && !isLoading && (
          <div className="text-center p-8 bg-blue-50 rounded-xl mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Connect Your Wallet</h3>
            <p className="text-blue-600 mb-4">Please connect your wallet to view available NFT collections</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">{renderSkeletons()}</div>
        ) : collections.length === 0 && isConnected ? (
          <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Collections Found</h3>
            <p className="text-gray-500">
              There are no NFT collections available at the moment. Check back later or create your own!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100"
                onClick={() => handleCardClick(collection)}
              >
                <div className="relative">
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {collection.totalMinted}/{collection.maxSupply}
                  </div>
                  <img
                    src={collection.previewImage || "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227724992-stock-illustration-image-available-icon-flat-vector.jpg"}
                    alt={collection.name}
                    className="w-full h-56 object-cover"
                    onError={(e) => {
                      e.target.src = "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227724992-stock-illustration-image-available-icon-flat-vector.jpg"
                    }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 text-gray-900">{collection.name}</h3>

                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                      {collection.mintPrice} ETH
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Contract:</span>
                      <span className="text-gray-500">{truncateAddress(collection.contractAddress)}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Total Minted:</span>
                      <span className="text-gray-500">
                        {collection.totalMinted} of {collection.maxSupply}
                      </span>
                    </p>
                  </div>

                  {/* {collection.tokenIds.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">Available Tokens:</p>
                      <div className="flex flex-wrap gap-2">
                        {collection.tokenIds.slice(0, 5).map((id) => (
                          <span key={id} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            #{id}
                          </span>
                        ))}
                        {collection.tokenIds.length > 5 && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            +{collection.tokenIds.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )} */}

                  <button
                    className="mt-5 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(collection)
                    }}
                  >
                    View Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

