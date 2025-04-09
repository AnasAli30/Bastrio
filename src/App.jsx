import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Home from "./components/Home"
import Explore from "./components/Explore"
import Create from "./components/Create"
import Footer from "./components/Footer"
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { arbitrum, mainnet, base } from '@reown/appkit/networks'
import CollectionDetail from "./components/CollectionDetail"
import Profile from "./components/Profile"
import Settings from "./components/Settings"
import VerifyEmail from "./components/VerifyEmail"
import { ThemeProvider } from "./context/ThemeContext"
import TrendingHeatmap from './components/TrendingHeatmap'

// 1. Get projectId
const projectId = '4eca2355824e0f47a6f1dd236a407e0f'

// 2. Set the networks
const networks = [arbitrum, mainnet, base]

// 3. Create a metadata object - optional
const metadata = {
  name: 'Bastrio',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true
  }
})

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-400">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/create" element={<Create />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/collection/:contractAddress" element={<CollectionDetail />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/trending" element={<TrendingHeatmap />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App

