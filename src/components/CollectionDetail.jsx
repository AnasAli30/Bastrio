import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ethers } from "ethers";
import NFT_COLLECTION_ABI from "../constant/abi.json";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";

export default function CollectionDetail() {
  const location = useLocation();
  const initialCollection = location.state?.collection;
  const { contractAddress } = useParams();
  const marketplaceContract = "0xF762a878921f173192b8E4F89A42E5797a523bdE";

  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const [collection, setCollection] = useState(initialCollection);
  const [isMinting, setIsMinting] = useState(false);
  const [loading, setLoading] = useState(!initialCollection);
  const [mintAmount, setMintAmount] = useState(1);
  const [nftData, setNftData] = useState([]); // Store metadata + images

  useEffect(() => {
    if (!initialCollection) {
      fetchCollectionDetails();
    } else {
      loadNFTMetadata(initialCollection);
    }
  }, [walletProvider]);

  // 🔹 Fetch Collection Details from Contract
  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(walletProvider);
      const contract = new ethers.Contract(marketplaceContract, NFT_COLLECTION_ABI, provider);

      const data = await contract.getCollectionsByContract(contractAddress);
      const metadataCID = data[2].replace("ipfs://", ""); // Extract metadata CID

      const formattedCollection = {
        contractAddress: contractAddress,
        metadataBaseURI: `https://gateway.lighthouse.storage/ipfs/${metadataCID}/`, // Metadata base URL
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

  // 🔹 Fetch NFT Metadata JSON for Minted NFTs
  const loadNFTMetadata = async (collectionData) => {
    if (!collectionData?.tokenIds?.length || !collectionData?.metadataBaseURI) return;

    try {
      const metadataList = await Promise.all(
        collectionData.tokenIds.map(async (id) => {
          const metadataUrl = `${collectionData.metadataBaseURI}${id}.json`;
          try {
            const response = await fetch(metadataUrl);
            const metadata = await response.json();

            // Extract Image CID from metadata and construct image URL
            const imageCID = metadata.image.replace("ipfs://", "");
            const imageUrl = `https://gateway.lighthouse.storage/ipfs/${imageCID}`;

            return {
              id,
              name: metadata.name || `NFT #${id}`,
              image: imageUrl, // Updated image retrieval
            };
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

  // 🔹 Mint NFTs
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
      fetchCollectionDetails(); // Refresh collection after minting
    } catch (error) {
      console.error("Minting error:", error);
      alert("Minting failed!");
    } finally {
      setIsMinting(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading collection details...</div>;
  console.log(collection);

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">{collection?.name || "NFT Collection"}</h2>

      {/* Display First NFT Image for Collection Preview */}
      {nftData.length > 0 ? (
        <img
          src={nftData[0].image}
          alt={nftData[0].name}
          className="w-full h-48 object-cover mb-4"
          onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
        />
      ) : (
        <p className="text-gray-600">No images available.</p>
      )}

      <p className="text-gray-600 mb-2">Contract: {collection?.contractAddress}</p>
      <p className="text-gray-600 mb-2">Max Supply: {collection?.maxSupply}</p>
      <p className="text-gray-600 mb-2">Total Minted: {collection?.tokenIds.length}</p>
      {collection?.mintPrice && (
        <p className="text-gray-600 mb-4">Mint Price: {ethers.formatEther(collection?.mintPrice)} ETH</p>
      )}

      {/* Minting Section */}
      <div className="mb-4">
        <label className="block text-gray-700">NFTs to Mint:</label>
        <input
          type="number"
          min="1"
          max={collection?.maxMintPerWallet}
          value={mintAmount}
          onChange={(e) => setMintAmount(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg mt-1"
        />
      </div>

      <button
        onClick={handleMintNFT}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition"
        disabled={isMinting}
      >
        {isMinting ? "Minting..." : "Mint NFT"}
      </button>

      {/* Display All Minted NFTs */}
      <h3 className="text-lg font-semibold mt-6 mb-2">Minted NFTs</h3>
      {nftData.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {nftData.map((nft) => (
            <div key={nft.id} className="p-2 border rounded-lg">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-24 object-cover rounded-md"
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              />
              <p className="text-center text-sm font-semibold mt-1">{nft.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No NFTs minted yet.</p>
      )}
    </div>
  );
}
