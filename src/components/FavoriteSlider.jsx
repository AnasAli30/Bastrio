import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const NFTCard = ({ item }) => {
  return (
    <div className="w-full sm:w-[300px] md:w-[320px] lg:w-[350px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
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
    <div className="w-full sm:w-[300px] md:w-[320px] lg:w-[350px] rounded-xl overflow-hidden shadow-md">
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
  const [slideDirection, setSlideDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderRef = useRef(null);
  const nextItemsRef = useRef([]);
  const [validImages, setValidImages] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Calculate number of visible items based on screen width
  const getVisibleItemCount = () => {
    if (windowWidth < 640) return 1; // Mobile
    if (windowWidth < 1024) return 2; // Tablet
    return 4; // Desktop
  };

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const getNextItems = () => {
    if (!favorites.length) return [];
    
    const visibleCount = getVisibleItemCount();
    const items = [];
    const nextIndex = (currentIndex + visibleCount) % favorites.length;
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (nextIndex + i) % favorites.length;
      items.push(favorites[index]);
    }
    return items;
  };

  const handleSlide = (direction) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSlideDirection(direction);
    
    // Store next items for animation
    nextItemsRef.current = getNextItems();
    
    if (sliderRef.current) {
      sliderRef.current.classList.add(`slide-${direction}`);
    }
    
    setTimeout(() => {
      if (sliderRef.current) {
        sliderRef.current.classList.remove(`slide-${direction}`);
      }
      
      setCurrentIndex(prev => {
        const visibleCount = getVisibleItemCount();
        if (direction === 'next') {
          const newIndex = prev + visibleCount;
          return newIndex >= favorites.length ? 0 : newIndex;
        } else {
          const newIndex = prev - visibleCount;
          return newIndex < 0 ? Math.floor((favorites.length - 1) / visibleCount) * visibleCount : newIndex;
        }
      });
      
      setSlideDirection(null);
      setIsAnimating(false);
    }, 500);
  };

  const handlePrev = () => handleSlide('prev');
  const handleNext = () => handleSlide('next');

  const getVisibleItems = () => {
    if (!favorites.length) return [];
    
    const visibleCount = getVisibleItemCount();
    const items = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % favorites.length;
      items.push(favorites[index]);
    }
    return items;
  };

  if (loading) {
    return (
      <div className="py-4 sm:py-6 lg:py-8">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 md:px-6 h-[350px] sm:h-[400px] md:h-[450px] lg:h-[550px]">
          {Array.from({ length: getVisibleItemCount() }).map((_, index) => (
            <div key={index} className="w-full sm:w-1/2 lg:w-1/4 flex justify-center px-2 sm:px-3">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!favorites.length) return null;

  return (
    <div className="py-4 sm:py-6 lg:py-8">
      <div className="relative">
        <div className="overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 md:px-6 h-[350px] sm:h-[400px] md:h-[450px] lg:h-[550px]"
            style={{ overflowX: 'hidden' }}
          >
            {getVisibleItems().map((item, index) => (
              <div
                key={index}
                className="relative group cursor-pointer w-full sm:w-1/2 lg:w-1/4 px-2 sm:px-3"
              >
                <NFTCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {slideDirection === 'next' && (
          <div className="absolute top-0 left-0 right-0 flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 md:px-6 h-[350px] sm:h-[400px] md:h-[450px] lg:h-[550px] slide-in-next" style={{ overflowX: 'hidden' }}>
            {nextItemsRef.current.map((item, index) => (
              <div
                key={`next-${index}`}
                className="relative group cursor-pointer w-full sm:w-1/2 lg:w-1/4 px-2 sm:px-3"
              >
                <NFTCard item={item} />
              </div>
            ))}
          </div>
        )}

        {slideDirection === 'prev' && (
          <div className="absolute top-0 left-0 right-0 flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 md:px-6 h-[350px] sm:h-[400px] md:h-[450px] lg:h-[550px] slide-in-prev" style={{ overflowX: 'hidden' }}>
            {nextItemsRef.current.map((item, index) => (
              <div
                key={`prev-${index}`}
                className="relative group cursor-pointer w-full sm:w-1/2 lg:w-1/4 px-2 sm:px-3"
              >
                <NFTCard item={item} />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handlePrev}
          disabled={isAnimating || favorites.length <= getVisibleItemCount()}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 bg-black/70 hover:bg-black p-2 sm:p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 disabled:opacity-50"
          aria-label="Previous items"
        >
          <FaChevronLeft className="text-base sm:text-lg md:text-xl text-white" />
        </button>
        <button
          onClick={handleNext}
          disabled={isAnimating || favorites.length <= getVisibleItemCount()}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 bg-black/70 hover:bg-black p-2 sm:p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 disabled:opacity-50"
          aria-label="Next items"
        >
          <FaChevronRight className="text-base sm:text-lg md:text-xl text-white" />
        </button>
      </div>
    </div>
  );
};

export default FavoriteSlider; 