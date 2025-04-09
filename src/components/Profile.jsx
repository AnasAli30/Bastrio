import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import {
  User,
  Wallet,
  Image as ImageIcon,
  Activity,
  FolderOpen,
  ExternalLink,
  Clock,
  Mail,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import NFT_COLLECTION_ABI from "../constant/abi.json";
import { useUserContext } from "../context/UserContext";

// TabContent component to handle tab content rendering
const TabContent = ({ activeTab, collections, selectedCollection, userActivity, formatAddress, formatTimeAgo }) => {
  if (activeTab === 'collections') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(selectedCollection ? [selectedCollection] : collections).map((collection) => (
          <Link
            key={collection.address}
            to={`/collection/${collection.address}`}
            className="group"
          >
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl overflow-hidden shadow-md transition-all duration-300 transform group-hover:scale-[1.02] group-hover:shadow-xl">
              <div className="aspect-video relative">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x200?text=Collection";
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {collection.name}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>#{collection.token_id}</span>
                  <span className="font-mono">{formatAddress(collection.address)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  } else if (activeTab === 'activity') {
    return (
      <div className="space-y-4">
        {userActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No activity found</p>
          </div>
        ) : (
          userActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50"
            >
              <div className="p-2 rounded-full bg-purple-100">
                {activity.type === 'mint' ? (
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                ) : (
                  <FolderOpen className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">
                  {activity.type === 'mint'
                    ? `Minted NFT #${activity.token_id} ${activity.collection?.name || 'Unknown Collection'}`
                    : `Sold #${activity.token_id} ${activity.collection?.name || 'Unknown Collection'} at ${activity.price || '0'} ${activity.currency || 'ETH'}`}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTimeAgo(activity.time)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
  
  return null;
};

export default function Profile() {
  const { userData } = useUserContext();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const marketplaceContract = "0xF762a878921f173192b8E4F89A42E5797a523bdE";

  const [collections, setCollections] = useState([]);
  const [collectionsStat, setCollectionsStat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collections');
  const [userActivity, setUserActivity] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [tabKey, setTabKey] = useState(0);

  // Simulated user data - in a real app, this would come from a backend
  const user = {
    name: userData?.user?.id || "User",
    profileImage: userData?.user?.image || "https://via.placeholder.com/150",
    joinedDate: "February 2024",
    email: userData?.user?.email || "",
    x: userData?.user?.x || ""
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchUserCollections();
      fetchUserActivity();
      fetchUserStat();
    }
  }, [address, isConnected]);

  const fetchUserCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("http://localhost:3000/api/getOwnerWallet", {
        params: {
          owner: address,
          limit: 200,
          page: 2,
          sort: "time-desc",
        },
      });
      
      const formattedCollections = await Promise.all(data.map(async (collection) => {
        return {
          address: collection.contract_address,
          name: collection.name,
          image: collection?.image || collection?.raw_image || "https://via.placeholder.com/400x200?text=Collection",
          token_id: collection.token_id,
          time: collection.time
        };
      }));

      setCollections(formattedCollections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError("Failed to load collections. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStat = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("http://localhost:3000/api/getWalletToken", {
        params: {
          owner: address
        },
      });
      
      const formattedCollections = await Promise.all(data.map(async (collection) => {
        return {
          count: collection.count || 0,
          listedCount: collection.listedCount || 0,
          name: collection.contractName || "Unknown Collection",
          image: collection?.collectionImage || "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500",
          contractAddress: collection.contractAddress,
          floor: collection.floor || 0,
          value: collection.value || 0
        };
      }));

      setCollectionsStat(formattedCollections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError("Failed to load collection statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("http://localhost:3000/api/getActivity", {
        params: {
          owner: address,
          limit: 100
        },
      });

      setUserActivity(data);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setError("Failed to load activity. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "N/A";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid date";
    
    timestamp = date.getTime();
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedCollections = [...collectionsStat].sort((a, b) => {
      if (a[key] === undefined || b[key] === undefined) return 0;
      
      if (typeof a[key] === 'string') {
        return direction === 'asc' 
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      
      return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
    });
    
    setCollectionsStat(sortedCollections);
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCollectionSelect = (collection) => {
    if (selectedCollection && selectedCollection.contractAddress === collection.contractAddress) {
      setSelectedCollection(null); // Deselect if already selected
    } else {
      setSelectedCollection(collection);
    }
  };

  const handleTabChange = (tab) => {
    console.log('Changing tab to:', tab);
    setActiveTab(tab);
    setTabKey(prev => prev + 1);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-primary-light dark:text-primary-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">Connect Wallet</h2>
          <p className="text-text-light dark:text-text-dark opacity-75">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  // Skeleton loading components
  const ProfileSkeleton = () => (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-lg bg-opacity-90 animate-pulse">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const CollectionsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden shadow-md animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
          <div className="p-4">
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ActivitySkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-center gap-4 p-4 rounded-lg bg-surface-light dark:bg-surface-dark animate-pulse">
          <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-9 h-9"></div>
          <div className="flex-1">
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const SidebarSkeleton = () => (
    <div className="p-4 h-full overflow-y-auto text-text-light dark:text-text-dark custom-scrollbar">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
      <div className="grid grid-cols-12 gap-3 px-3 py-2 text-sm border-b border-gray-200 dark:border-gray-700">
        <div className="col-span-5">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="col-span-3">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-1 mt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="w-full p-3 rounded-lg grid grid-cols-12 gap-2 items-center bg-gray-100 dark:bg-gray-800 animate-pulse">
            <div className="col-span-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="col-span-3">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="flex">
       {/* Sidebar */}
       <div className={`fixed h-screen bg-surface-light dark:bg-surface-dark shadow-xl transition-all duration-300 z-10 ${sidebarOpen ? 'w-[28rem]' : 'w-0'}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-10 top-1/2 transform -translate-y-1/2 bg-surface-light dark:bg-surface-dark p-2 rounded-r-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
           {sidebarOpen ? (
              <ChevronLeft className="w-6 h-6 text-text-light dark:text-text-dark" />
            ) : (
              <ChevronRight className="w-6 h-6 text-text-light dark:text-text-dark" />
            )}
          </button>
          
          {sidebarOpen && (
            loading ? <SidebarSkeleton /> : (
              <div className="p-4 h-full overflow-y-auto text-text-light dark:text-text-dark custom-scrollbar">
                <style jsx>{`
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: var(--scrollbar-track);
                    border-radius: 4px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--scrollbar-thumb);
                    border-radius: 4px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--scrollbar-thumb-hover);
                  }
                  :root {
                    --scrollbar-track: #F3F4F6;
                    --scrollbar-thumb: #D1D5DB;
                    --scrollbar-thumb-hover: #9CA3AF;
                  }
                  .dark {
                    --scrollbar-track: #1F2937;
                    --scrollbar-thumb: #374151;
                    --scrollbar-thumb-hover: #4B5563;
                  }
                `}</style>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                    <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Collections</h3>
                  </div>
                  <input
                    type="text"
                    placeholder="Search collections..."
                    className="w-full px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search collections"
                  />
                </div>

                {/* Collection Headers */}
                <div className="grid grid-cols-12 gap-3 px-3 py-2 text-sm text-text-light dark:text-text-dark border-b border-gray-200 dark:border-gray-700">
                  <div className="col-span-5">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1 hover:text-primary-light dark:hover:text-primary-dark"
                      aria-label="Sort by name"
                    >
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort("floor")}
                      className="flex items-center gap-1 hover:text-primary-light dark:hover:text-primary-dark"
                      aria-label="Sort by floor price"
                    >
                      Floor
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort("value")}
                      className="flex items-center gap-1 hover:text-primary-light dark:hover:text-primary-dark"
                      aria-label="Sort by value"
                    >
                      Value
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-3">
                    <button
                      onClick={() => handleSort("listedCount")}
                      className="flex items-center gap-1 hover:text-primary-light dark:hover:text-primary-dark"
                      aria-label="Sort by listed count"
                    >
                      Listed
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {collectionsStat.map((collection) => (
                    <button
                      key={collection.contractAddress}
                      onClick={() => handleCollectionSelect(collection)}
                      className={`w-full p-3 rounded-lg transition-all grid grid-cols-12 gap-2 items-center ${
                        selectedCollection && selectedCollection.contractAddress === collection.contractAddress
                          ? 'bg-primary-light dark:bg-primary-dark bg-opacity-20 dark:bg-opacity-20 hover:bg-opacity-30 dark:hover:bg-opacity-30'
                          : 'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      aria-label={`Select ${collection.name} collection`}
                    >
                      <div className="col-span-5 flex items-center gap-2">
                        <img
                          src={collection.image}
                          alt={collection.name}
                          className="w-8 h-8 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/32?text=NFT";
                          }}
                        />
                        <span className="text-sm font-medium truncate text-text-light dark:text-text-dark">
                          {collection.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm text-text-light dark:text-text-dark opacity-75">
                        {collection?.floor?.toFixed(4) || "0.0000"}
                      </div>
                      <div className="col-span-2 text-sm text-text-light dark:text-text-dark opacity-75">
                        {collection?.value?.toFixed(4) || "0.0000"}
                      </div>
                      <div className="col-span-3 text-sm text-text-light dark:text-text-dark opacity-75">
                        {collection.listedCount || 0} / {collection.count || 0}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-96 pl-9' : 'ml-0'}`}>
          <div className="py-12 px-8 custom-scrollbar">
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: var(--scrollbar-track);
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: var(--scrollbar-thumb);
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: var(--scrollbar-thumb-hover);
              }
              :root {
                --scrollbar-track: #F3F4F6;
                --scrollbar-thumb: #D1D5DB;
                --scrollbar-thumb-hover: #9CA3AF;
              }
              .dark {
                --scrollbar-track: #1F2937;
                --scrollbar-thumb: #374151;
                --scrollbar-thumb-hover: #4B5563;
              }
            `}</style>
            <div className="max-w-7xl mx-auto">
              {/* Profile Header */}
              {loading ? <ProfileSkeleton /> : (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-lg bg-opacity-90">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary-light dark:from-primary-dark to-purple-400 dark:to-purple-600">
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150?text=Profile";
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">{user.name}</h1>
                      <div className="flex flex-col md:flex-row items-center gap-4 text-text-light dark:text-text-dark opacity-75">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                          <a
                            href={`https://etherscan.io/address/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono hover:text-primary-light dark:hover:text-primary-dark transition-colors flex items-center gap-1"
                          >
                            {formatAddress(address)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                          <span>Joined {user.joinedDate}</span>
                        </div>
                        {user.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                            <span>{user.email}</span>
                          </div>
                        )}
                        {user.x && (
                          <div className="flex items-center gap-2">
                            <img
                              src="https://img.freepik.com/premium-vector/new-twitter-logo-x-2023-twitter-x-logo-official-vector-download_691560-10797.jpg?semt=ais_hybrid"
                              alt="X"
                              className="w-6 h-6"
                            />
                            <a
                              href={`https://twitter.com/${user.x}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary-light dark:hover:text-primary-dark"
                            >
                              @{user.x}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4" role="alert">
                  <p>{error}</p>
                </div>
              )}

              {/* Tabs */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg bg-opacity-90">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex">
                    <button
                      onClick={() => handleTabChange('collections')}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === 'collections'
                          ? 'border-b-2 border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                          : 'text-text-light dark:text-text-dark opacity-75 hover:opacity-100'
                      }`}
                      aria-selected={activeTab === 'collections'}
                      role="tab"
                    >
                      <FolderOpen className="w-4 h-4" />
                      My Collections
                    </button>
                    <button
                      onClick={() => handleTabChange('activity')}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === 'activity'
                          ? 'border-b-2 border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                          : 'text-text-light dark:text-text-dark opacity-75 hover:opacity-100'
                      }`}
                      aria-selected={activeTab === 'activity'}
                      role="tab"
                    >
                      <Activity className="w-4 h-4" />
                      Activity
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {loading ? (
                    activeTab === 'collections' ? <CollectionsSkeleton /> : <ActivitySkeleton />
                  ) : (
                    <div key={tabKey}>
                      {activeTab === 'collections' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {(selectedCollection ? [selectedCollection] : collections).map((collection) => (
                            <Link
                              key={collection.address}
                              to={`/collection/${collection.address}`}
                              className="group"
                            >
                              <div className="bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden shadow-md transition-all duration-300 transform group-hover:scale-[1.02] group-hover:shadow-xl">
                                <div className="aspect-video relative">
                                  <img
                                    src={collection.image}
                                    alt={collection.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "https://via.placeholder.com/400x200?text=Collection";
                                    }}
                                  />
                                </div>
                                <div className="p-4">
                                  <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
                                    {collection.name}
                                  </h3>
                                  <div className="flex items-center justify-between text-sm text-text-light dark:text-text-dark opacity-75">
                                    <span>#{collection.token_id}</span>
                                    <span className="font-mono">{formatAddress(collection.address)}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      {activeTab === 'activity' && (
                        <div className="space-y-4">
                          {userActivity.length === 0 ? (
                            <div className="text-center py-8 text-text-light dark:text-text-dark opacity-75">
                              <p>No activity found</p>
                            </div>
                          ) : (
                            userActivity.map((activity, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-4 rounded-lg bg-surface-light dark:bg-surface-dark"
                              >
                                <div className="p-2 rounded-full bg-primary-light dark:bg-primary-dark bg-opacity-20">
                                  {activity.type === 'mint' ? (
                                    <ImageIcon className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                                  ) : (
                                    <FolderOpen className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-text-light dark:text-text-dark font-medium">
                                    {activity.type === 'mint'
                                      ? `Minted NFT #${activity.token_id} ${activity.collection?.name || 'Unknown Collection'}`
                                      : `Sold #${activity.token_id} ${activity.collection?.name || 'Unknown Collection'} at ${activity.price || '0'} ${activity.currency || 'ETH'}`}
                                  </p>
                                  <p className="text-sm text-text-light dark:text-text-dark opacity-75">
                                    {formatTimeAgo(activity.time)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}