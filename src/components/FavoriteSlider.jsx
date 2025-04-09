import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const NFTCard = ({ item }) => {
  return (
    <div className="w-[350px] rounded-xl overflow-hidden">
      <div className="aspect-[3/4] relative">
        <img
          src={item.background_image_url || item.image_url}
          alt={item.name}
          className="w-full h-full object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 group-hover:to-black/70 transition-all duration-300 rounded-xl" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
          />
          <div className="ml-3">
            <h3 className="text-white font-semibold text-lg truncate">{item.name}</h3>
            <p className="text-gray-200">Floor: {item.floor} ETH</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="w-[350px] rounded-xl overflow-hidden">
      <div className="aspect-[3/4] relative animate-pulse bg-gray-700/30 rounded-xl">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-600/30 animate-pulse" />
            <div className="ml-3 space-y-2">
              <div className="h-5 w-32 bg-gray-600/30 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-600/30 rounded animate-pulse" />
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
    
    const items = [];
    const nextIndex = (currentIndex + 4) % favorites.length;
    
    for (let i = 0; i < 4; i++) {
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
        if (direction === 'next') {
          const newIndex = prev + 4;
          return newIndex >= favorites.length ? 0 : newIndex;
        } else {
          const newIndex = prev - 4;
          return newIndex < 0 ? Math.floor((favorites.length - 1) / 4) * 4 : newIndex;
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
    
    const items = [];
    for (let i = 0; i < 4; i++) {
      const index = (currentIndex + i) % favorites.length;
      items.push(favorites[index]);
    }
    return items;
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex justify-center items-center gap-8 px-4 h-[550px]">
          {[0, 1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!favorites.length) return null;

  return (
    <div className="py-8">
      <div className="relative">
        <div className="overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex justify-center items-center gap-8 px-4 h-[550px]"
            style={{ overflowX: 'hidden' }}
          >
            {getVisibleItems().map((item, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
              >
                <NFTCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {slideDirection === 'next' && (
          <div className="absolute top-0 left-0 right-0 flex justify-center items-center gap-8 px-4 h-[550px] slide-in-next" style={{ overflowX: 'hidden' }}>
            {nextItemsRef.current.map((item, index) => (
              <div
                key={`next-${index}`}
                className="relative group cursor-pointer"
              >
                <NFTCard item={item} />
              </div>
            ))}
          </div>
        )}

        {slideDirection === 'prev' && (
          <div className="absolute top-0 left-0 right-0 flex justify-center items-center gap-8 px-4 h-[550px] slide-in-prev" style={{ overflowX: 'hidden' }}>
            {nextItemsRef.current.map((item, index) => (
              <div
                key={`prev-${index}`}
                className="relative group cursor-pointer"
              >
                <NFTCard item={item} />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handlePrev}
          disabled={isAnimating}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/70 hover:bg-black p-4 rounded-full shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          <FaChevronLeft className="text-xl text-white" />
        </button>
        <button
          onClick={handleNext}
          disabled={isAnimating}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/70 hover:bg-black p-4 rounded-full shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          <FaChevronRight className="text-xl text-white" />
        </button>
      </div>
    </div>
  );
};

export default FavoriteSlider; 