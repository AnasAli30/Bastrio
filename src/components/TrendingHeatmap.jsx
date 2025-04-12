import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TrendingHeatmap error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-3">Something went wrong</h2>
          <p className="text-text-DEFAULT dark:text-text-dark mb-4">
            There was an error loading the heatmap data
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="btn btn-primary"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const TrendingHeatmap = () => {
  // All state declarations at the top - maintain consistent order
  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const observerRef = useRef(null);
  const itemsRef = useRef({});

  // Enhanced color function that uses theme colors
  const getGradientColors = useMemo(() => (volumeChange) => {
    if (!volumeChange || volumeChange === 0) {
      return 'from-secondary-light to-secondary-dark';
    }
    if (volumeChange > 0) {
      if (volumeChange > 50) return 'from-emerald-500 to-emerald-700';
      if (volumeChange > 25) return 'from-emerald-400 to-emerald-600';
      return 'from-emerald-300 to-emerald-500';
    }
    if (volumeChange < -50) return 'from-red-500 to-red-700';
    if (volumeChange < -25) return 'from-red-400 to-red-600';
    return 'from-red-300 to-red-500';
  }, []);

  // Responsive size calculation based on viewport and value
  const getResponsiveSize = useCallback((change, windowWidth) => {
    const absChange = Math.abs(change || 0);
    
    // Base size adjusts with screen width
    let baseSize = 96;
    let maxSize = 320;
    
    // Adjust sizes based on viewport
    if (windowWidth < 640) { // Small screens
      baseSize = 80;
      maxSize = 160;
    } else if (windowWidth < 768) { // Medium screens
      baseSize = 85;
      maxSize = 200;
    } else if (windowWidth < 1024) { // Large screens
      baseSize = 90;
      maxSize = 250;
    }
    
    // Logarithmic scale for better visualization
    const logScale = Math.log10(Math.max(1, absChange));
    const size = Math.max(baseSize, Math.min(maxSize, baseSize + (logScale * 80)));
    
    return size;
  }, []);

  // Setup intersection observer for image lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target.querySelector('.lazy-image');
            if (img && img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy-image');
              observerRef.current.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: '100px' }
    );
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe new items after render
  useEffect(() => {
    if (trendingData.length > 0 && observerRef.current) {
      Object.values(itemsRef.current).forEach(item => {
        if (item) {
          observerRef.current.observe(item);
        }
      });
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [trendingData]);

  // Fetch data with proper error handling
  const fetchTrendingData = useCallback(async () => {
    setLoading(true);
    setError(false);
    
    try {
      const response = await fetch('http://localhost:3000/api/getTrending');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const sortedData = data.data.sort((a, b) => 
        Math.abs(b.floor_24h) - Math.abs(a.floor_24h)
      );
      
      setTrendingData(sortedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trending data:', error);
      setLoading(false);
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchTrendingData();
  }, [fetchTrendingData]);

  // Window resize handler with debouncing
  useEffect(() => {
    let timeoutId = null;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 200); // Debounce by 200ms
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoized tile sizes to prevent unnecessary recalculations on every render
  const tileSizes = useMemo(() => {
    return trendingData.map(item => getResponsiveSize(item.floor_24h, windowWidth));
  }, [trendingData, windowWidth, getResponsiveSize]);

  // Focus management for keyboard navigation
  const handleKeyDown = (event, index) => {
    const itemsArray = Object.values(itemsRef.current).filter(Boolean);

    if (event.key === 'ArrowRight' && index < itemsArray.length - 1) {
      itemsArray[index + 1].focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      itemsArray[index - 1].focus();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // Calculate the number of items per row based on window width
      let itemsPerRow = 5;
      if (windowWidth < 640) itemsPerRow = 2;
      else if (windowWidth < 768) itemsPerRow = 3;
      else if (windowWidth < 1024) itemsPerRow = 4;

      const targetIndex = event.key === 'ArrowUp' 
        ? index - itemsPerRow 
        : index + itemsPerRow;

      if (targetIndex >= 0 && targetIndex < itemsArray.length) {
        itemsArray[targetIndex].focus();
      }
    }
  };

  // Enhanced Skeleton Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fadeIn">

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div 
              key={index}
              className="card animate-pulse bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden"
              style={{ 
                width: index % 3 === 0 ? '160px' : '120px', 
                height: index % 3 === 0 ? '160px' : '120px' 
              }}
            >
              <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="w-1/2 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card max-w-md mx-auto p-6 text-center animate-fadeIn">
          <svg 
            className="w-16 h-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h2 className="text-xl font-bold text-text-DEFAULT dark:text-text-dark mb-2">Failed to load data</h2>
          <p className="text-secondary-DEFAULT dark:text-secondary-light mb-4">
            There was an error loading the trending collections.
          </p>
          <button 
            className="btn btn-primary"
            onClick={fetchTrendingData}
            aria-label="Retry loading trending collections"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 animate-fadeIn">
       
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {trendingData.map((item, index) => {
            const size = tileSizes[index];
            const percentChange = (item.floor_24h || 0).toFixed(2);
            const isPositive = item.floor_24h > 0;
            const isNeutral = !item.floor_24h || item.floor_24h === 0;
            
            return (
              <Link 
                key={item.contract_address || index} 
                to={`/collection/${item.contract_address}`}
                className="card flex justify-center items-center transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                ref={el => itemsRef.current[index] = el}
                aria-label={`${item.name} collection, ${percentChange}% floor price change in 24 hours`}
                tabIndex="0"
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={{ 
                  width: `${size}px`, 
                  height: `${size}px`,
                  maxWidth: '100%'
                }}
              >
                <div 
                  className={`
                    w-full h-full rounded-lg overflow-hidden
                    relative group bg-gradient-to-br ${getGradientColors(item.floor_24h)}
                  `}
                >
                  {/* Background image with lazy loading */}
                  <div className="absolute inset-0 opacity-40">
                    <img 
                      className="lazy-image w-full h-full object-cover"
                      data-src={item.image_url || item.image_url_original } 
                      src="/placeholder.png"
                      alt=""
                      aria-hidden="true"
                      onError={(e) => {
                        e.target.onerror = null;
                        // e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>
                  
                  {/* Content overlay with improved visual hierarchy */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 flex flex-col items-center justify-center p-3 z-10 transition-opacity duration-200 group-hover:opacity-90">
                    <div className="text-sm sm:text-base md:text-lg font-bold text-white text-center mb-1 line-clamp-2 max-w-full">
                      {item.name}
                    </div>
                    <div className={`
                      text-base sm:text-xl md:text-2xl font-extrabold mt-1
                      ${isPositive ? 'text-green-300' : isNeutral ? 'text-gray-300' : 'text-red-300'}
                      transition-all duration-200 group-hover:scale-110
                    `}>
                      {isPositive ? '+' : ''}{percentChange}%
                    </div>
                    <div className="text-xs text-white/80 mt-2">
                      Floor change (24h)
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Wrap the component export with ErrorBoundary for additional safety
export default function TrendingHeatmapWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <TrendingHeatmap />
    </ErrorBoundary>
  );
};
