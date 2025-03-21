import React, { useState, useEffect } from "react";
import { Form, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
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

  useEffect(() => {
    // console.log(ini)
    if (!initialCollection) {
      fetchCollectionDetails();
    }
  }, [walletProvider]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(walletProvider);
      const contract = new ethers.Contract(marketplaceContract, NFT_COLLECTION_ABI, provider);
      
      const data = await contract.getCollectionsByContract(contractAddress);
      const formattedCollection = {
        contractAddress: contractAddress,
        baseURI: data[2].replace("ipfs://", "https://ipfs.io/ipfs/"),
        maxSupply: data[3].toString(),
        maxMintPerWallet: data[4].toString(),
        mintPrice: data[5].toString(),
        tokenIds: data[0].map(id => id.toString()),
        listedStatus: data[1],
      };

      console.log(formattedCollection)

      setCollection(formattedCollection);
    } catch (error) {
      console.error("Error fetching collection details:", error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error("Minting error:", error);
      alert("Minting failed!");
    } finally {
      setIsMinting(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading collection details...</div>;

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">{collection?.name || "NFT Collection"}</h2>
      <img
        src={collection?.baseURI}
        alt={collection?.name}
        className="w-full h-48 object-cover mb-4"
        onError={(e) =>
          (e.target.src =
            "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227725020-stock-illustration-image-available-icon-flat-vector.jpg")
        }
      />
      <p className="text-gray-600 mb-2">Contract: {collection?.contractAddress}</p>
      <p className="text-gray-600 mb-2">Max Supply: {collection?.maxSupply}</p>
      <p className="text-gray-600 mb-2">Total Minted: {collection?.tokenIds.length}</p>
      {collection?.mintPrice?<p className="text-gray-600 mb-4">Mint Price: {ethers.formatEther(collection?.mintPrice)} ETH</p>:""}

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
    </div>
  );
}
