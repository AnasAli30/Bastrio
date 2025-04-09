"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { upload } from "@lighthouse-web3/sdk"
import MARKETPLACE_ABI from "../constant/abi.json"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { Trash2, Upload, Plus, Loader2 } from "lucide-react"

export default function CreateCollection() {
  const { isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("eip155")

  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [maxSupply, setMaxSupply] = useState("")
  const [mintPrice, setMintPrice] = useState("")
  const [maxMintPerWallet, setMaxMintPerWallet] = useState("")
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const LIGHTHOUSE_API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY
  const MARKETPLACE_ADDRESS = "0xF762a878921f173192b8E4F89A42E5797a523bdE"

  // 🖼️ Upload Images
  const uploadImages = async () => {
    if (!files.length) return alert("No files selected!")
    setIsUploading(true)
    setUploadProgress(10)

    try {
      const renamedFiles = files.map((file, index) => new File([file], `${index + 1}.png`, { type: file.type }))
      setUploadProgress(30)
      const response = await upload(renamedFiles, LIGHTHOUSE_API_KEY, true)
      setUploadProgress(60)
      const folderCID = response.data.Hash
      console.log("Uploaded Images Folder CID:", folderCID)
      return folderCID
    } catch (error) {
      console.error("Image upload failed:", error)
      alert("Failed to upload images.")
      return null
    }
  }

  // 📜 Generate Metadata
  const generateMetadataFiles = (folderCID) => {
    return files.map((_, index) => ({
      name: `${name} #${index + 1}`,
      description: `NFT ${index + 1} from the ${name} collection`,
      image: `ipfs://${folderCID}/${index + 1}.png`,
      attributes: [{ trait_type: "Edition", value: index + 1 }],
    }))
  }

  // 📂 Upload Metadata
  const uploadMetadata = async (folderCID) => {
    try {
      setUploadProgress(70)
      const metadataFiles = generateMetadataFiles(folderCID)
      const metadataBlobs = metadataFiles.map(
        (meta, index) => new File([JSON.stringify(meta)], `${index + 1}.json`, { type: "application/json" }),
      )

      const response = await upload(metadataBlobs, LIGHTHOUSE_API_KEY, true)
      setUploadProgress(90)
      const metadataFolderCID = response.data.Hash
      console.log("Uploaded Metadata Folder CID:", metadataFolderCID)
      return metadataFolderCID
    } catch (error) {
      console.error("Metadata upload failed:", error)
      alert("Failed to upload metadata.")
      return null
    }
  }

  // 🚀 Create NFT Collection
  const createCollection = async (e) => {
    e.preventDefault()
    if (!files.length) return alert("Please upload images!")

    setIsCreating(true)

    try {
      const folderCID = await uploadImages()
      if (!folderCID) {
        setIsCreating(false)
        setIsUploading(false)
        return
      }

      const metadataFolderCID = await uploadMetadata(folderCID)
      if (!metadataFolderCID) {
        setIsCreating(false)
        setIsUploading(false)
        return
      }

      const provider = new ethers.BrowserProvider(walletProvider)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer)

      setUploadProgress(95)
      const tx = await contract.createCollection(
        name,
        symbol,
        `ipfs://${metadataFolderCID}/`,
        maxSupply,
        ethers.parseEther(mintPrice),
        maxMintPerWallet,
      )
      await tx.wait()
      setUploadProgress(100)

      alert("Collection Created Successfully!")
      setName("")
      setSymbol("")
      setMaxSupply("")
      setMintPrice("")
      setMaxMintPerWallet("")
      setFiles([])
    } catch (error) {
      console.error("Error creating collection:", error)
      alert("Failed to create collection.")
    } finally {
      setIsCreating(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden mt-10 mb-10">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
        <h3 className="text-2xl font-bold text-white mb-1 text-center">Create NFT Collection</h3>
        <p className="text-purple-100 text-center text-sm">Upload your artwork and create your own NFT collection</p>
      </div>

      <form onSubmit={createCollection} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Collection"
              required
            />
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symbol</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="MAC"
              required
            />
          </div>

          {/* Max Supply */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Supply</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all"
              value={maxSupply}
              onChange={(e) => setMaxSupply(e.target.value)}
              placeholder="10000"
              required
            />
          </div>

          {/* Mint Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mint Price (ETH)</label>
            <input
              type="number"
              step="0.001"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all"
              value={mintPrice}
              onChange={(e) => setMintPrice(e.target.value)}
              placeholder="0.05"
              required
            />
          </div>

          {/* Max Mint Per Wallet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Mint Per Wallet</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all"
              value={maxMintPerWallet}
              onChange={(e) => setMaxMintPerWallet(e.target.value)}
              placeholder="5"
              required
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Collection Images</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-all bg-gray-50 dark:bg-gray-700/50">
            <input
              type="file"
              multiple
              onChange={(e) => setFiles([...e.target.files])}
              className="hidden"
              id="file-upload"
              accept="image/*"
              required
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-purple-500 dark:text-purple-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Drag and drop your images here, or click to browse</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all font-medium text-sm flex items-center"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <Plus className="h-4 w-4 mr-1" /> Select Files
                </button>
              </div>
            </label>
          </div>
        </div>

        {/* Image Preview */}
        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Images ({files.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700 group-hover:opacity-75 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded-b-md">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
            <div
              className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading || isCreating}
        >
          {isUploading || isCreating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {isUploading ? "Uploading to IPFS..." : "Creating Collection..."}
            </>
          ) : (
            "Create Collection"
          )}
        </button>

        {!isConnected && (
          <div className="text-center mt-4 text-sm text-red-500 dark:text-red-400">Please connect your wallet to create a collection</div>
        )}
      </form>
    </div>
  )
}

