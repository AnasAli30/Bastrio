import React from "react"
import CreateCollection from "./CreateCollection"

export default function Create() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Your NFT</h1>
      <p className="text-xl mb-8">Mint your unique digital</p>
      <CreateCollection />
    </div>
  )
}

