import React, { useState } from "react"

const Button = ({ children, className, ...props }) => (
  <button className={`px-4 py-2 rounded font-bold text-white transition-colors ${className}`} {...props}>
    {children}
  </button>
)

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
    {...props}
  />
)

const Textarea = ({ className, ...props }) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
    {...props}
  />
)

const Label = ({ children, className, ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
  </label>
)

export default function MintNFT() {
  const [nftName, setNftName] = useState("")
  const [nftDescription, setNftDescription] = useState("")
  const [file, setFile] = useState(null)
  const [isMinting, setIsMinting] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleMint = async (e) => {
    e.preventDefault()
    setIsMinting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert("NFT minted successfully on Abstract Chain!")
      setNftName("")
      setNftDescription("")
      setFile(null)
    } catch (error) {
      console.error("Failed to mint NFT:", error)
      alert("Failed to mint NFT. Please try again.")
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h3 className="text-xl font-bold mb-4">Mint Your NFT on Abstract Chain</h3>
        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <Label htmlFor="nftName">NFT Name</Label>
            <Input
              id="nftName"
              type="text"
              placeholder="Enter NFT name"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nftDescription">Description</Label>
            <Textarea
              id="nftDescription"
              placeholder="Describe your NFT"
              value={nftDescription}
              onChange={(e) => setNftDescription(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="file">Upload File</Label>
            <Input id="file" type="file" onChange={handleFileChange} required />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isMinting}>
            {isMinting ? "Minting..." : "Mint NFT"}
          </Button>
        </form>
      </div>
    </div>
  )
}

