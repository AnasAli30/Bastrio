import React, { useState } from "react";
import { ethers } from "ethers";
import { upload } from "@lighthouse-web3/sdk";
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
  const [files, setFiles] = useState([]);
  const [folderCID, setFolderCID] = useState(null);
  const [metadataCIDs, setMetadataCIDs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const LIGHTHOUSE_API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
  const MARKETPLACE_ADDRESS = "0xF762a878921f173192b8E4F89A42E5797a523bdE";

  // 🔹 Upload all images inside a folder and return folder CID
  const uploadImagesFolder = async () => {
    if (!files.length) return alert("No files selected!");
    setIsUploading(true);

    try {
      const response = await upload(files, LIGHTHOUSE_API_KEY, false);  
      const cid = response.data.Hash;
      setFolderCID(cid);
      console.log("📂 Images uploaded in folder CID:", cid);
      return cid;
    } catch (error) {
      console.error("❌ Image upload failed:", error);
      alert("Failed to upload images.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 🔹 Generate metadata JSON for each NFT
  const generateMetadata = (folderCID, id) => ({
    name: `${name} #${id}`,
    description: `NFT ${id} from the ${name} collection`,
    image: `ipfs://${folderCID}/${id}.png`,  // 🔥 Reference image inside the folder
    attributes: [{ trait_type: "Edition", value: id }]
  });

  // 🔹 Upload metadata JSON files
  const uploadMetadataFiles = async (folderCID) => {
    try {
      const metadataList = files.map((_, i) => generateMetadata(folderCID, i + 1));
      const metadataBlobs = metadataList.map((meta) => new Blob([JSON.stringify(meta)], { type: "application/json" }));

      let uploadedMetadataCIDs = [];
      for (const blob of metadataBlobs) {
        const response = await upload([blob], LIGHTHOUSE_API_KEY, false);
        uploadedMetadataCIDs.push(response.data.Hash);
      }

      console.log("📄 Metadata CIDs:", uploadedMetadataCIDs);
      return uploadedMetadataCIDs;
    } catch (error) {
      console.error("❌ Metadata upload failed:", error);
      alert("Failed to upload metadata.");
      return null;
    }
  };

  // 🔹 Handle Collection Creation
  const createCollection = async (e) => {
    e.preventDefault();
    if (!files.length) return alert("Please upload images!");

    setIsCreating(true);

    try {
      const folderCID = await uploadImagesFolder();
      if (!folderCID) return;

      const metadataCIDs = await uploadMetadataFiles(folderCID);
      if (!metadataCIDs) return;
      setMetadataCIDs(metadataCIDs);

      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

      const tx = await contract.createCollection(
        name,
        symbol,
        metadataCIDs[0], // Store first metadata CID as base
        maxSupply,
        ethers.parseEther(mintPrice),
        maxMintPerWallet
      );
      await tx.wait();

      alert("✅ Collection Created!");
      setName("");
      setSymbol("");
      setMaxSupply("");
      setMintPrice("");
      setMaxMintPerWallet("");
      setFiles([]);
      setFolderCID(null);
      setMetadataCIDs([]);
    } catch (error) {
      console.error("❌ Error creating collection:", error);
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
            <Label>Upload Collection Images</Label>
            <Input type="file" multiple onChange={(e) => setFiles([...e.target.files])} required />
          </div>

          {folderCID && (
            <div className="text-sm text-gray-600">
              <p>🌐 Folder CID: <a href={`https://gateway.lighthouse.storage/ipfs/${folderCID}`} target="_blank" rel="noopener noreferrer">{folderCID}</a></p>
              {metadataCIDs.map((cid, i) => (
                <p key={i}>
                  NFT #{i + 1}:{" "}
                  <a href={`https://gateway.lighthouse.storage/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">
                    View Metadata
                  </a>
                </p>
              ))}
            </div>
          )}

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isUploading || isCreating}>
            {isUploading ? "Uploading..." : isCreating ? "Creating..." : "Create Collection"}
          </Button>
        </form>
      </div>
    </div>
  );
}
