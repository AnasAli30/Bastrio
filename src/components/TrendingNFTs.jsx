import React, { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const TrendingNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: 'volume',
    direction: 'desc'
  });
  const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  // Update mobile view state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTrendingNFTs();
  }, []);

  const fetchTrendingNFTs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/getTrending');
      const data = await response.json();
    //   console.log(data)
      setNfts(data?.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trending NFTs:', error);
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedNFTs = () => {
    const sortedNFTs = [...nfts].sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    });
    return sortedNFTs;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-2" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-2" />
      : <FaSortDown className="ml-2" />;
  };

  if (loading) {
    return (
      <div className="py-4 sm:py-6 md:py-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white">Trending NFTs</h2>
        
        <div className="flex justify-center items-center min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
        </div>
        
        {/* Skeleton cards for mobile view */}
        {isMobileView && (
          <div className="grid grid-cols-1 gap-4 mt-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Mobile Card View Component
  const NFTMobileCard = ({ nft }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <img 
            className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            src={nft.image_url}
            alt={nft.name}
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {nft.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {nft.chain}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{nft.volume.toFixed(2)} ETH</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Floor</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{nft.floor.toFixed(3)} ETH</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Sales</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{nft.sales}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Owners</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{nft.owners}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-4 sm:py-6 md:py-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white">Trending NFTs</h2>
      
      {/* Mobile View - Card Layout */}
      {isMobileView ? (
        <div className="grid grid-cols-1 gap-4">
          {getSortedNFTs().map((nft, index) => (
            <NFTMobileCard key={index} nft={nft} />
          ))}
        </div>
      ) : (
        /* Desktop View - Table Layout */
        <div className="overflow-x-auto rounded-lg shadow">
          <div className="min-w-full bg-white dark:bg-gray-800">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Collection
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('volume')}
                  >
                    Volume {getSortIcon('volume')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('floor')}
                  >
                    Floor {getSortIcon('floor')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('sales')}
                  >
                    Sales {getSortIcon('sales')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('owners')}
                  >
                    Owners {getSortIcon('owners')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {getSortedNFTs().map((nft, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover"
                            src={nft.image_url}
                            alt={nft.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {nft.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {nft.chain}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {nft.volume.toFixed(2)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {nft.floor.toFixed(3)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {nft.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {nft.owners}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingNFTs; 