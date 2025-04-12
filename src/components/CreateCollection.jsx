"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { upload } from "@lighthouse-web3/sdk"
import MARKETPLACE_ABI from "../constant/abi.json"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { Trash2, Upload, Plus, Loader2, AlertCircle, CheckCircle, Info, X } from "lucide-react"

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
  const [errors, setErrors] = useState({})
  const [previewsLoading, setPreviewsLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const LIGHTHOUSE_API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY
  const MARKETPLACE_ADDRESS = "0xF762a878921f173192b8E4F89A42E5797a523bdE"

  // Validation function
  const validateForm = () => {
    const newErrors = {}
    
    if (!name.trim()) newErrors.name = "Collection name is required"
    if (name.length > 50) newErrors.name = "Name must be less than 50 characters"
    
    if (!symbol.trim()) newErrors.symbol = "Symbol is required"
    if (symbol.length > 10) newErrors.symbol = "Symbol must be less than 10 characters"
    
    if (!maxSupply) newErrors.maxSupply = "Max supply is required"
    if (maxSupply <= 0) newErrors.maxSupply = "Max supply must be greater than 0"
    if (maxSupply > 10000) newErrors.maxSupply = "Max supply cannot exceed 10,000"
    
    if (!mintPrice) newErrors.mintPrice = "Mint price is required"
    if (mintPrice < 0) newErrors.mintPrice = "Mint price cannot be negative"
    
    if (!maxMintPerWallet) newErrors.maxMintPerWallet = "Max mint per wallet is required"
    if (maxMintPerWallet <= 0) newErrors.maxMintPerWallet = "Must be greater than 0"
    if (maxMintPerWallet > maxSupply) newErrors.maxMintPerWallet = "Cannot exceed max supply"
    
    if (files.length === 0) newErrors.files = "At least one image is required"
    if (files.length > 100) newErrors.files = "Maximum 100 images allowed"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };
  
  // 🖼️ Upload Images
  const uploadImages = async () => {
    if (!files.length) {
      showNotification("No files selected!", "error");
      return null;
    }
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
      showNotification("Failed to upload images: " + error.message, "error")
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
      showNotification("Failed to upload metadata: " + error.message, "error")
      return null
    }
  }

  // 🚀 Create NFT Collection
  const createCollection = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showNotification("Please fix the errors in the form", "error")
      return
    }
    
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

      showNotification("Collection created successfully!", "success")
      setName("")
      setSymbol("")
      setMaxSupply("")
      setMintPrice("")
      setMaxMintPerWallet("")
      setFiles([])
      setErrors({})
    } catch (error) {
      console.error("Error creating collection:", error)
      showNotification("Failed to create collection: " + error.message, "error")
    } finally {
      setIsCreating(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
    // Remove file error if files were previously empty
    if (errors.files && files.length > 1) {
      const newErrors = {...errors}
      delete newErrors.files
      setErrors(newErrors)
    }
  }

  // Handle file drop
  const handleDragEvent = (e, active) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(active)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setPreviewsLoading(true)
      setFiles([...files, ...Array.from(e.dataTransfer.files)])
      setTimeout(() => setPreviewsLoading(false), 300) // Allow time for previews to generate
      
      // Clear any file-related errors
      if (errors.files) {
        const newErrors = {...errors}
        delete newErrors.files
        setErrors(newErrors)
      }
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setPreviewsLoading(true)
      setFiles([...files, ...Array.from(e.target.files)])
      setTimeout(() => setPreviewsLoading(false), 300)
      
      // Clear any file-related errors
      if (errors.files) {
        const newErrors = {...errors}
        delete newErrors.files
        setErrors(newErrors)
      }
    }
  }
  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden mt-8 sm:mt-10 mb-8 sm:mb-10">
      {/* Notification Toast */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-start max-w-md animate-slideDown 
            ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' : 
             notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200' :
             'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200'}`}
        >
          <div className="mr-2 flex-shrink-0 mt-0.5">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Info className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 mr-2 text-sm">{notification.message}</div>
          <button 
            onClick={() => setNotification(null)}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 text-center">Create NFT Collection</h3>
        <p className="text-purple-100 text-center text-sm">Upload your artwork and create your own NFT collection</p>
      </div>

      <form onSubmit={createCollection} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection Name</label>
            <input
              type="text"
              className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Collection"
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symbol</label>
            <input
              type="text"
              className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border ${errors.symbol ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all`}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="MAC"
              aria-invalid={errors.symbol ? "true" : "false"}
              aria-describedby={errors.symbol ? "symbol-error" : undefined}
            />
            {errors.symbol && (
              <p id="symbol-error" className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.symbol}</p>
            )}
          </div>

          {/* Max Supply */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Supply</label>
            <input
              type="number"
              className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border ${errors.maxSupply ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all`}
              value={maxSupply}
              onChange={(e) => setMaxSupply(e.target.value)}
              placeholder="10000"
              aria-invalid={errors.maxSupply ? "true" : "false"}
              aria-describedby={errors.maxSupply ? "maxsupply-error" : undefined}
            />
            {errors.maxSupply && (
              <p id="maxsupply-error" className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.maxSupply}</p>
            )}
          </div>

          {/* Mint Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mint Price (ETH)</label>
            <input
              type="number"
              step="0.001"
              className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border ${errors.mintPrice ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all`}
              value={mintPrice}
              onChange={(e) => setMintPrice(e.target.value)}
              placeholder="0.05"
              aria-invalid={errors.mintPrice ? "true" : "false"}
              aria-describedby={errors.mintPrice ? "mintprice-error" : undefined}
            />
            {errors.mintPrice && (
              <p id="mintprice-error" className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.mintPrice}</p>
            )}
          </div>

          {/* Max Mint Per Wallet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Mint Per Wallet</label>
            <input
              type="number"
              className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border ${errors.maxMintPerWallet ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 text-gray-900 dark:text-white transition-all`}
              value={maxMintPerWallet}
              onChange={(e) => setMaxMintPerWallet(e.target.value)}
              placeholder="5"
              aria-invalid={errors.maxMintPerWallet ? "true" : "false"}
              aria-describedby={errors.maxMintPerWallet ? "maxmint-error" : undefined}
            />
            {errors.maxMintPerWallet && (
              <p id="maxmint-error" className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.maxMintPerWallet}</p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        {/* Image Upload with Drag and Drop */}
        <div className="mt-4 sm:mt-6">
          <div 
            className={`border-2 ${errors.files ? 'border-red-400 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} ${dragActive ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20' : ''} border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-all bg-gray-50 dark:bg-gray-700/50`}
            onDragEnter={(e) => handleDragEvent(e, true)}
            onDragOver={(e) => handleDragEvent(e, true)}
            onDragLeave={(e) => handleDragEvent(e, false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept="image/*"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center justify-center">
                <Upload className={`h-8 w-8 sm:h-10 sm:w-10 mb-2 ${dragActive ? 'text-purple-600 dark:text-purple-400' : 'text-purple-500 dark:text-purple-400'} transition-colors`} />
                <p className="text-sm text-gray-600 dark:text-gray-300">Drag and drop your images here, or click to browse</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                <button
                  type="button"
                  className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all font-medium text-sm flex items-center"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <Plus className="h-4 w-4 mr-1" /> Select Files
                </button>
              </div>
            </label>
            {errors.files && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.files}</p>
            )}
          </div>
        </div>
        {/* Image Preview */}
        {files.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Images ({files.length})</h4>
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {previewsLoading ? (
                Array.from({ length: Math.min(8, files.length) }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-md"></div>
                ))
              ) : (
                files.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700 group-hover:opacity-75 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded-b-md">
                      #{index + 1}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
            <div
              className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full transition-all duration-300 ease-in-out relative"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress >= 10 && (
                <span className="absolute top-3 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {uploadProgress}%
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading || isCreating || !isConnected}
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
          <div className="text-center mt-4 text-sm text-red-500 dark:text-red-400">
            Please connect your wallet to create a collection
          </div>
        )}
      </form>
    </div>
  )
}

