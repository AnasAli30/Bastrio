import  {getWeb3State}  from "../utiles/getWeb3State"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitProvider } from '@reown/appkit/react'

export default function Header() {
  const {isConnected } = useAppKitAccount()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { walletProvider } = useAppKitProvider('eip155')

  useEffect(()=>{
    const fetch = async()=>{
     const data =  await getWeb3State(walletProvider);
      console.log(data)
    }

    if(isConnected){
      fetch()
    }
  },[isConnected])

  return (
    <header className="bg-background shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Abstrio
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/explore" className="text-secondary hover:text-primary">
              Drops
            </Link>
            <Link to="/create" className="text-secondary hover:text-primary">
              Create
            </Link>
            <appkit-button />
          </div>
          <div className="md:hidden">
         
          </div>
        </div>
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            <Link to="/explore" className="block py-2 text-secondary hover:text-primary">
              Explore
            </Link>
            <Link to="/create" className="block py-2 text-secondary hover:text-primary">
              Create
            </Link>
           <appkit-button/>
          </div>
        )}
      </nav>
    </header>
  )
}

