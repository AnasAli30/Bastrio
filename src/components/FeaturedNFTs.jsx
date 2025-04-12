"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { ethers } from "ethers"
import { Link } from "react-router-dom"
import NFT_MARKETPLACE_ABI from "../constant/abi.json"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
export default function FeaturedNFTs() {
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imagesLoaded, setImagesLoaded] = useState({})
  const observerRef = useRef(null)
  const itemsRef = useRef({})
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

  // Setup intersection observer for image lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target.querySelector('.lazy-image');
            if (img && img.dataset.src) {
              // Start loading the image
              const newImg = new Image();
              newImg.src = img.dataset.src;
              newImg.onload = () => {
                // Once loaded, set the src and mark as loaded
                img.src = img.dataset.src;
                img.classList.remove('lazy-image');
                img.classList.add('loaded');
                setImagesLoaded(prev => ({
                  ...prev,
                  [img.dataset.id]: true
                }));
              };
              
              newImg.onerror = () => {
                // Handle error
                img.src = "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227724992-stock-illustration-image-available-icon-flat-vector.jpg";
                img.classList.remove('lazy-image');
                img.classList.add('error');
              };
              
              // Stop observing this element
              observerRef.current.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: '200px' } // Load images 200px before they come into view
    );
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe collection items for lazy loading
  useEffect(() => {
    if (collections.length > 0 && observerRef.current) {
      // Reset the image loaded state for new collections
      setImagesLoaded({});
      
      // Observe all collection items
      Object.values(itemsRef.current).forEach(item => {
        if (item) {
          observerRef.current.observe(item);
        }
      });
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [collections]);

  // Function to truncate address
  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  // Retry loading the collections
  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // Small timeout to ensure state has updated
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, []);

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(6)
      .fill()
      .map((_, index) => (
        <div 
          key={`skeleton-${index}`} 
          className="card bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse"
        >
          <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-white dark:from-gray-900 to-gray-50 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-12 animate-fadeIn">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Featured NFT Collections
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl sm:max-w-2xl mx-auto">
            Discover unique digital assets created by talented artists from around the world
          </p>
        </div>

        {error && (
          <div className="text-center p-4 sm:p-6 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto animate-slideDown">
            <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none"
              aria-label="Retry loading collections"
            >
              Retry
            </button>
          </div>
        )}

        {!isConnected && !isLoading && (
          <div className="text-center p-6 sm:p-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto animate-fadeIn">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">Connect Your Wallet</h3>
            <p className="text-sm sm:text-base text-blue-600 dark:text-blue-400 mb-4">Please connect your wallet to view available NFT collections</p>
            <div className="flex justify-center">
              <appkit-button />
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {renderSkeletons()}
          </div>
        ) : collections.length === 0 && isConnected ? (
          <div className="text-center p-6 sm:p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto animate-fadeIn">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Collections Found</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              There are no NFT collections available at the moment. Check back later or create your own!
            </p>
            <Link
              to="/create"
              className="inline-block mt-4 px-6 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary-light transition-colors focus:ring-2 focus:ring-primary-light/50 dark:focus:ring-primary-dark/50 focus:outline-none"
            >
              Create Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {collections.map((collection, index) => (
              <Link
                key={collection.contractAddress || index}
                to={`/collection/${collection.contractAddress}`}
                className="group block transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 rounded-xl"
                ref={el => itemsRef.current[collection.contractAddress || index] = el}
                style={{ animationDelay: `${index * 100}ms` }}
                aria-label={`View ${collection.name} collection`}
              >
                <div className="card overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 transition-all duration-300 group-hover:shadow-xl h-full animate-fadeIn">
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {/* Placeholder while image is loading */}
                    <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse transition-opacity duration-300 ${imagesLoaded[collection.contractAddress] ? 'opacity-0' : 'opacity-100'}`}></div>
                    
                    {/* Actual image with lazy loading */}
                    <img
                      className={`lazy-image w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110 ${
                        imagesLoaded[collection.contractAddress] ? 'opacity-100' : 'opacity-0'
                      }`}
                      data-src={collection.previewImage || "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227724992-stock-illustration-image-available-icon-flat-vector.jpg"}
                      src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                      alt=""
                      data-id={collection.contractAddress}
                      aria-hidden="true"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Price info that slides up on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm font-medium">Mint Price</span>
                        <span className="text-lg font-bold">{collection.mintPrice} ETH</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                      {collection.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {collection.totalMinted} / {collection.maxSupply} minted
                      </span>
                      <span className="text-primary-light dark:text-primary-dark font-medium">
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
