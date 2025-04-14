import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const NFTCard = ({ item }) => {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="aspect-[3/4] relative">
        <img
          src={item.background_image_url || item.image_url}
          alt={item.name}
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 group-hover:to-black/70 transition-all duration-300 rounded-xl" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <div className="flex items-center">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-lg"
            loading="lazy"
          />
          <div className="ml-2 sm:ml-3">
            <h3 className="text-white font-semibold text-base sm:text-lg truncate">{item.name}</h3>
            <p className="text-gray-200 text-sm sm:text-base">Floor: {item.floor} ETH</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-md">
      <div className="aspect-[3/4] relative animate-pulse bg-gray-700/30 rounded-xl">
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-600/30 animate-pulse" />
            <div className="ml-2 sm:ml-3 space-y-1 sm:space-y-2">
              <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-600/30 rounded animate-pulse" />
              <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-600/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FavoriteSlider = ({ address }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchFavorites();
  }, [address]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/getOwnerFavorites?owner=${address}`);
      const data = await response.json();
      
      // Filter out NFTs with missing images
      const validNFTs = await filterValidImages(data?.data || []);
      setFavorites(validNFTs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setLoading(false);
    }
  };

  const filterValidImages = async (nfts) => {
    const validNFTs = [];
    
    for (const nft of nfts) {
      try {
        const imageUrl = nft.background_image_url || nft.image_url;
        if (!imageUrl) continue;
        
        // Check if image exists
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok) {
          validNFTs.push(nft);
        }
      } catch (error) {
        console.error('Error checking image:', error);
      }
    }
    
    return validNFTs;
  };

  const handleSlide = (direction) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const itemsPerSlide = 4;
    const totalSlides = Math.ceil(favorites.length / itemsPerSlide);
    
    setCurrentIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % totalSlides;
      } else {
        return (prev - 1 + totalSlides) % totalSlides;
      }
    });
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const getCurrentSlideItems = () => {
    const itemsPerSlide = 4;
    const startIndex = currentIndex * itemsPerSlide;
    return favorites.slice(startIndex, startIndex + itemsPerSlide);
  };

  if (loading) {
    return (
      <div className="py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!favorites.length) return null;

  const currentItems = getCurrentSlideItems();
  const totalSlides = Math.ceil(favorites.length / 4);

  return (
    <div className="py-4 sm:py-6 lg:py-8 relative">
      <div className="overflow-hidden">
        <div 
          ref={sliderRef}
          className="grid grid-cols-4 gap-4 sm:gap-6 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {currentItems.map((item, index) => (
            <div key={index} className="w-full">
              <NFTCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {totalSlides > 1 && (
        <>
          <button
            onClick={() => handleSlide('prev')}
            disabled={isAnimating}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-black/70 hover:bg-black p-2 sm:p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 disabled:opacity-50"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="text-base sm:text-lg md:text-xl text-white" />
          </button>
          <button
            onClick={() => handleSlide('next')}
            disabled={isAnimating}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-black/70 hover:bg-black p-2 sm:p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 disabled:opacity-50"
            aria-label="Next slide"
          >
            <FaChevronRight className="text-base sm:text-lg md:text-xl text-white" />
          </button>
        </>
      )}
    </div>
  );
};

export default FavoriteSlider; 