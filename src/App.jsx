import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Home from "./components/Home"
import Explore from "./components/Explore"
import Create from "./components/Create"
import Footer from "./components/Footer"

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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App

