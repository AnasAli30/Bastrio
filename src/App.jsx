import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Home from "./components/Home"
import Explore from "./components/Explore"
import Create from "./components/Create"
import Footer from "./components/Footer"
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { arbitrum, mainnet,base } from '@reown/appkit/networks'
import CollectionDetail from "./components/CollectionDetail";
import Profile from "./components/Profile"

// 1. Get projectId
const projectId = '4eca2355824e0f47a6f1dd236a407e0f'

// 2. Set the networks
const networks = [arbitrum, mainnet,base]

// 3. Create a metadata object - optional
const metadata = {
  name: 'Abstrio',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background text-secondary">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/create" element={<Create />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/collection/:contractAddress" element={<CollectionDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App

