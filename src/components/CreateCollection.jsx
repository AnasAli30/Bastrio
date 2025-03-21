import React, { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import MARKETPLACE_ABI from "../constant/abi.json";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";


const Button = ({ children, className, ...props }) => (
  <button className={`px-4 py-2 rounded font-bold text-white transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
    {...props}
  />
);

const Label = ({ children, className, ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
  </label>
);

export default function CreateCollection() {
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  const [mintPrice, setMintPrice] = useState("");
  const [maxMintPerWallet, setMaxMintPerWallet] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const MARKETPLACE_ADDRESS = "0xF762a878921f173192b8E4F89A42E5797a523bdE";

  // **🔹 Upload image to IPFS via Pinata**
  const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: "NFT Collection Image",
      keyvalues: { type: "collection" },
    });

    formData.append("pinataMetadata", metadata);
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    try {
      setIsUploading(true);
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: import.meta.env.VITE_PINATA_KEYS,
          pinata_secret_api_key:import.meta.env.VITE_PINATA_SECRET,
        },
      });

      return `ipfs://${res.data.IpfsHash}/`;
    } catch (error) {
      console.error("IPFS upload failed:", error);
      alert("Failed to upload image.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // **🔹 Handle Collection Creation**
  const createCollection = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload an image!");

    setIsCreating(true);

    try {
      const baseURI = await uploadToIPFS(file);
      if (!baseURI) return;

      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

      const tx = await contract.createCollection(
        name,
        symbol,
        baseURI,
        maxSupply,
        ethers.parseEther(mintPrice),
        maxMintPerWallet
      );
      await tx.wait();

      alert("Collection Created!");
      setName("");
      setSymbol("");
      setMaxSupply("");
      setMintPrice("");
      setMaxMintPerWallet("");
      setFile(null);
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h3 className="text-xl font-bold mb-4">Create an NFT Collection</h3>
        <form onSubmit={createCollection} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input type="text" placeholder="Collection Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Symbol</Label>
            <Input type="text" placeholder="Collection Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
          </div>
          <div>
            <Label>Max Supply</Label>
            <Input type="number" placeholder="500" value={maxSupply} onChange={(e) => setMaxSupply(e.target.value)} required />
          </div>
          <div>
            <Label>Mint Price (ETH)</Label>
            <Input type="number" placeholder="0.05" value={mintPrice} onChange={(e) => setMintPrice(e.target.value)} required />
          </div>
          <div>
            <Label>Max Mint Per Wallet</Label>
            <Input type="number" placeholder="5" value={maxMintPerWallet} onChange={(e) => setMaxMintPerWallet(e.target.value)} required />
          </div>
          <div>
            <Label>Upload Collection Image</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files[0])} required />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isUploading || isCreating}>
            {isUploading ? "Uploading..." : isCreating ? "Creating..." : "Create Collection"}
          </Button>
        </form>
      </div>
    </div>
  );
}
