import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TrendingHeatmap = () => {
  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBackgroundColor = (volumeChange) => {
    if (!volumeChange || volumeChange === 0) return 'bg-gray-500';
    if (volumeChange > 0) {
      if (volumeChange > 50) return 'bg-emerald-600';
      if (volumeChange > 25) return 'bg-emerald-500';
      return 'bg-emerald-400';
    }
    if (volumeChange < -50) return 'bg-red-600';
    if (volumeChange < -25) return 'bg-red-500';
    return 'bg-red-400';
  };

  // Calculate size directly based on the change value
  const getSize = (change) => {
    const absChange = Math.abs(change || 0);
    
    // Base size for 0% change
    const baseSize = 96;
    
    // Scale factor - how much to increase size per percentage point
    const scaleFactor = 2;
    
    // Calculate size directly from the change value
    // Using a logarithmic scale for better differentiation of large values
    const logScale = Math.log10(Math.max(1, absChange));
    const size = Math.max(baseSize, Math.min(800, baseSize + (logScale * 100)));
    
    return size;
  };

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/getTrending');
      const data = await response.json();
      const sortedData = data.data.sort((a, b) => 
        Math.abs(b.floor_24h) - Math.abs(a.floor_24h)
      );
      
      setTrendingData(sortedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trending data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
 
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>

        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
   
      <div className="flex flex-wrap justify-center gap-4">
        {trendingData.map((item, index) => {
          const size = getSize(item.floor_24h);
          
          return (
            <Link 
              key={item.contract_address || index} 
              to={`/collection/${item.contract_address}`}
              className="transition-transform hover:scale-105"
            >
              <div 
                className={`
                  ${getBackgroundColor(item.floor_24h)}
                  flex flex-col items-center justify-center
                  rounded-lg shadow-lg overflow-hidden
                  text-white font-bold
                  relative
                `}
                style={{ width: `${size}px`, height: `${size}px` }}
              >
                {/* Background image */}
                <div className="absolute inset-0 opacity-30">
                  <img 
                    src={item.image_url || item.image_url_original || '/placeholder.png'} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.png';
                    }}
                  />
                </div>
                
                {/* Content overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-2 z-10">
                  <div className="text-sm md:text-base truncate max-w-full px-1 text-center font-bold">
                    {item.name}
                  </div>
                  <div className={`text-xl md:text-2xl font-extrabold mt-2 ${
                    item.floor_24h > 0 ? 'text-green-100' : item.floor_24h < 0 ? 'text-red-100' : 'text-gray-100'
                  }`}>
                    {item.floor_24h > 0 ? '+' : ''}{(item.floor_24h || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingHeatmap; 