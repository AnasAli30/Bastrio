import React, { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { ethers } from "ethers";
import { Loader2, Wallet, Package, Users } from "lucide-react";
import NFT_COLLECTION_ABI from "../constant/abi.json";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";

export default function CollectionDetail() {
  const location = useLocation();
  const { contractAddress } = useParams();
  const marketplaceContract = "0xF762a878921f173192b8E4F89A42E5797a523bdE";

  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const [collection, setCollection] = useState(location.state?.collection || null);
  const [isMinting, setIsMinting] = useState(false);
  const [loading, setLoading] = useState(!collection);
  const [mintAmount, setMintAmount] = useState(1);
  const [nftData, setNftData] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(location.state?.nft || null);

  useEffect(() => {
    if (!collection) {
      fetchCollectionDetails();
    } else {
      loadNFTMetadata(collection);
    }
  }, [walletProvider]);

  useEffect(() => {
    if (selectedNFT) {
      fetchSingleNFTMetadata(selectedNFT.id);
    }
  }, [selectedNFT]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(walletProvider);
      const contract = new ethers.Contract(marketplaceContract, NFT_COLLECTION_ABI, provider);

      const data = await contract.getCollectionsByContract(contractAddress);
      const metadataCID = data[2].replace("ipfs://", "");

      const formattedCollection = {
        contractAddress,
        metadataBaseURI: `https://gateway.lighthouse.storage/ipfs/${metadataCID}/`,
        maxSupply: data[3].toString(),
        maxMintPerWallet: data[4].toString(),
        mintPrice: data[5].toString(),
        tokenIds: data[0].map(id => id.toString()),
        listedStatus: data[1],
      };

      setCollection(formattedCollection);
      loadNFTMetadata(formattedCollection);
    } catch (error) {
      console.error("Error fetching collection details:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNFTMetadata = async (collectionData) => {
    try {
      const metadataList = await Promise.all(
        collectionData.tokenIds.map(async (id) => {
          const metadataUrl = `${collectionData.metadataBaseURI}/${id}.json`;
          try {
            const response = await fetch(metadataUrl);
            const metadata = await response.json();

            let imageUrl = metadata.image.startsWith("ipfs://")
              ? `https://gateway.lighthouse.storage/ipfs/${metadata.image.replace("ipfs://", "")}`
              : metadata.image;

            return { id, name: metadata.name || `NFT #${id}`, image: imageUrl };
          } catch (err) {
            console.error(`Error loading metadata for NFT ${id}:`, err);
            return null;
          }
        })
      );

      setNftData(metadataList.filter((nft) => nft !== null));
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  const fetchSingleNFTMetadata = async (id) => {
    if (!collection?.metadataBaseURI) return;

    try {
      const metadataUrl = `${collection.metadataBaseURI}${id}.json`;
      const response = await fetch(metadataUrl);
      const metadata = await response.json();

      let imageUrl = metadata.image.startsWith("ipfs://")
        ? `https://gateway.lighthouse.storage/ipfs/${metadata.image.replace("ipfs://", "")}`
        : metadata.image;

      setSelectedNFT({ id, name: metadata.name || `NFT #${id}`, image: imageUrl });
    } catch (error) {
      console.error("Error loading single NFT metadata:", error);
    }
  };

  const handleMintNFT = async () => {
    if (!isConnected || !walletProvider) {
      alert("Connect your wallet first!");
      return;
    }
    if (mintAmount < 1 || mintAmount > Number(collection.maxMintPerWallet)) {
      alert(`Mint amount must be between 1 and ${collection.maxMintPerWallet}`);
      return;
    }

    try {
      setIsMinting(true);
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(marketplaceContract, NFT_COLLECTION_ABI, signer);

      const mintPrice = ethers.parseEther((Number(collection.mintPrice) * mintAmount).toString());
      const tx = await contract.mintNFT(contractAddress, mintAmount, { value: mintPrice });
      await tx.wait();

      alert("NFTs minted successfully!");
      fetchCollectionDetails();
    } catch (error) {
      console.error("Minting error:", error);
      alert("Minting failed!");
    } finally {
      setIsMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600 font-medium">Loading collection details...</p>
        </div>
      </div>
    );
  }

  const mintedCount = collection?.tokenIds?.length || 0;
  const maxSupply = Number(collection?.maxSupply) || 0;
  const mintProgress = (mintedCount / maxSupply) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Featured Image */}
            <div className="w-full md:w-1/2">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {(selectedNFT || nftData[0]) && (
                  <img
                    src={selectedNFT?.image || nftData[0].image}
                    alt={selectedNFT?.name || nftData[0].name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/800")}
                  />
                )}
              </div>
              {/* Minting Progress */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Minting Progress</span>
                  <span className="text-sm font-medium text-gray-700">
                    {mintedCount} / {maxSupply} NFTs
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${mintProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  {(100 - mintProgress).toFixed(1)}% remaining to mint
                </p>
              </div>
            </div>

            {/* Collection Info */}
            <div className="w-full md:w-1/2">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {collection?.name || "NFT Collection"}
              </h1>

              <div className="grid gap-4 mb-8">
                <div className="flex items-center gap-3 text-gray-600">
                  <Wallet className="w-5 h-5" />
                  <span className="font-medium">Contract:</span>
                  <span className="text-sm font-mono">{collection?.contractAddress}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Supply:</span>
                  <span>{collection?.maxSupply} max</span>
                  <span className="mx-2">•</span>
                  <span>{collection?.tokenIds.length} minted</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Mint Price:</span>
                  <span>{collection?.mintPrice && ethers.formatEther(Number(collection?.mintPrice))} ETH</span>
                </div>
              </div>

              {/* Minting Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of NFTs to Mint
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={collection?.maxMintPerWallet}
                    value={mintAmount}
                    onChange={(e) => setMintAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Max {collection?.maxMintPerWallet} per wallet
                  </p>
                </div>

                <button
                  onClick={handleMintNFT}
                  disabled={isMinting}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isMinting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Minting...
                    </span>
                  ) : (
                    "Mint NFT"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Collection Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {nftData.map((nft) => (
              <Link
                key={nft.id}
                to={`/collection/${contractAddress}`}
                state={{ nft, collection }}
                className="group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 transition-transform group-hover:scale-105">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/400")}
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900 text-center">
                  {nft.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}