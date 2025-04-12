import React from "react"
import { Link } from "react-router-dom"

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-6 sm:py-8 md:py-12">
      {/* Background decorative elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-primary-light/10 to-purple-500/10 dark:from-primary-dark/10 dark:to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-primary-light/10 to-purple-500/10 dark:from-primary-dark/10 dark:to-purple-400/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="card p-6 sm:p-8 md:p-12 lg:p-16 rounded-xl shadow-lg overflow-hidden">
          {/* Mobile-optimized content container with responsive max-width */}
          <div className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto md:mx-0">
            {/* Text heading with gradient and responsive sizing */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight bg-gradient-to-r from-primary-light to-purple-600 dark:from-primary-dark dark:to-purple-400 bg-clip-text text-transparent animate-fadeIn">
              Discover, Collect, and Create Extraordinary NFTs
            </h1>
            
            {/* Subheading with responsive sizing and improved readability */}
            <p className="text-base sm:text-lg md:text-xl text-text-light dark:text-text-dark opacity-90 mb-6 sm:mb-8 md:mb-10 max-w-md sm:max-w-lg md:max-w-2xl">
              Join the future of digital collectibles. Create, buy, sell, and trade unique NFTs on multiple blockchains.
            </p>
            
            {/* Responsive button container with improved spacing */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link 
                to="/explore" 
                className="btn btn-primary text-center sm:text-left py-3 px-6 text-base sm:text-lg font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                aria-label="Explore NFT collections"
              >
                Explore Collections
              </Link>
              <Link 
                to="/create" 
                className="btn btn-secondary text-center sm:text-left py-3 px-6 text-base sm:text-lg font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                aria-label="Create your NFT"
              >
                Start Creating
              </Link>
            </div>
            
            {/* Stats bar (optional) - can be uncommented if stats should be shown */}
            {/* <div className="mt-12 flex flex-wrap justify-start gap-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="text-center sm:text-left">
                <p className="text-3xl font-bold text-primary-light dark:text-primary-dark">10K+</p>
                <p className="text-sm text-text-light dark:text-text-dark mt-1">Collections</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-3xl font-bold text-primary-light dark:text-primary-dark">200K+</p>
                <p className="text-sm text-text-light dark:text-text-dark mt-1">NFTs</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-3xl font-bold text-primary-light dark:text-primary-dark">50K+</p>
                <p className="text-sm text-text-light dark:text-text-dark mt-1">Artists</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  )
}

