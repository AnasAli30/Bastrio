import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import NFT_MARKETPLACE_ABI from "../constant/abi.json";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";

export default function FeaturedNFTs() {
  const [collections, setCollections] = useState([]);
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const navigate = useNavigate();

  const NFT_MARKETPLACE_ADDRESS = "0xF762a878921f173192b8E4F89A42E5797a523bdE";

  useEffect(() => {
    async function fetchCollections() {
      if (!isConnected || !walletProvider) return;

      try {
        const provider = new ethers.BrowserProvider(walletProvider);
        const contract = new ethers.Contract(
          NFT_MARKETPLACE_ADDRESS,
          NFT_MARKETPLACE_ABI,
          provider
        );

        const collectionsData = await contract.getCollections();
console.log(collectionsData)
        const formattedCollections = collectionsData.map((collection) => ({
          contractAddress: collection[0],
          name: collection[1],
          maxSupply: String(collection[2]),
          mintPrice: String(collection[3]),
          baseURI: collection[4].replace("ipfs://", "https://ipfs.io/ipfs/"),
          totalMinted: String(collection[5]),
          tokenIds: collection[6].map((id) => String(id)), 
        }));

        setCollections(formattedCollections);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    }

    fetchCollections();
  }, [isConnected, walletProvider]);

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
          Featured NFT Collections
        </h2>
        {collections.length === 0 ? (
          <p className="text-center text-gray-500">No Collections available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {collections.map((collection, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 cursor-pointer"
                onClick={() =>
                  navigate(`/collection/${collection.contractAddress}`, { state: { collection } })
                } // Navigate with state
              >
                <img
                  src={collection.baseURI}
                  alt={collection.name}
                  className="w-full h-48 object-cover"
                  onError={(e) =>
                    (e.target.src =
                      "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227725020-stock-illustration-image-available-icon-flat-vector.jpg")
                  }
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{collection.name}</h3>
                  <p className="text-gray-600">
                    Contract: {collection.contractAddress.slice(0, 6)}...
                    {collection.contractAddress.slice(-4)}
                  </p>
                  <p className="text-gray-600">Max Supply: {collection.maxSupply}</p>
                  <p className="text-gray-600">Total Minted: {collection.totalMinted}</p>
                  <p className="text-gray-600">
                    Mint Price: {ethers.formatEther(collection.mintPrice)} ETH
                  </p>
                  <p className="text-gray-600">
                    Tokens: {collection.tokenIds.length > 0 ? collection.tokenIds.join(", ") : "None"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
