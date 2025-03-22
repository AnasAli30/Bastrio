import React, { useState } from "react";
import { ethers } from "ethers";
import { upload } from "@lighthouse-web3/sdk";
import MARKETPLACE_ABI from "../constant/abi.json";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";

export default function CreateCollection() {
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  const [mintPrice, setMintPrice] = useState("");
  const [maxMintPerWallet, setMaxMintPerWallet] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const LIGHTHOUSE_API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
  const MARKETPLACE_ADDRESS = "0xF762a878921f173192b8E4F89A42E5797a523bdE";

  // 🖼️ **Step 1: Upload all images in a single folder**
  const uploadImages = async () => {
    if (!files.length) return alert("No files selected!");
    setIsUploading(true);

    try {
      // Rename files to tokenId.png before upload
      const renamedFiles = files.map((file, index) => new File([file], `${index + 1}.png`, { type: file.type }));

      // Upload all images as a single batch (folder)
      const response = await upload(renamedFiles, LIGHTHOUSE_API_KEY, true);
      const folderCID = response.data.Hash;
      console.log("Uploaded Images Folder CID:", folderCID);

      return folderCID; // Store single folder CID
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload images.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 📜 **Step 2: Generate metadata files (one per NFT)**
  const generateMetadataFiles = (folderCID) => {
    return files.map((_, index) => {
      const tokenId = index + 1;
      return {
        name: `${name} #${tokenId}`,
        description: `NFT ${tokenId} from the ${name} collection`,
        image: `ipfs://${folderCID}/${tokenId}.png`, // Only image URL
        attributes: [{ trait_type: "Edition", value: tokenId }],
      };
    });
  };

  // 📂 **Step 3: Upload all metadata files in a single folder**
  const uploadMetadata = async (folderCID) => {
    try {
      const metadataFiles = generateMetadataFiles(folderCID);
      const metadataBlobs = metadataFiles.map((meta, index) => 
        new File([JSON.stringify(meta)], `${index + 1}.json`, { type: "application/json" })
      );

      const response = await upload(metadataBlobs, LIGHTHOUSE_API_KEY, true);
      const metadataFolderCID = response.data.Hash;
      console.log("Uploaded Metadata Folder CID:", metadataFolderCID);

      return metadataFolderCID;
    } catch (error) {
      console.error("Metadata upload failed:", error);
      alert("Failed to upload metadata.");
      return null;
    }
  };

  // 🚀 **Step 4: Create the NFT Collection**
  const createCollection = async (e) => {
    e.preventDefault();
    if (!files.length) return alert("Please upload images!");

    setIsCreating(true);

    try {
      const folderCID = await uploadImages();
      if (!folderCID) return;

      const metadataFolderCID = await uploadMetadata(folderCID);
      if (!metadataFolderCID) return;

      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

      const tx = await contract.createCollection(
        name,
        symbol,
        `ipfs://${metadataFolderCID}/`, // Only one CID for all metadata
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
      setFiles([]);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" className="w-full px-3 py-2 border rounded-md" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
            <input type="text" className="w-full px-3 py-2 border rounded-md" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Supply</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md" value={maxSupply} onChange={(e) => setMaxSupply(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mint Price (ETH)</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md" value={mintPrice} onChange={(e) => setMintPrice(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Mint Per Wallet</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md" value={maxMintPerWallet} onChange={(e) => setMaxMintPerWallet(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Collection Images</label>
            <input type="file" multiple onChange={(e) => setFiles([...e.target.files])} required />
          </div>

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold" disabled={isUploading || isCreating}>
            {isUploading ? "Uploading..." : isCreating ? "Creating..." : "Create Collection"}
          </button>
        </form>
      </div>
    </div>
  );
}
