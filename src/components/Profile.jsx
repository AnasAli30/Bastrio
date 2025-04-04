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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
console.log(activeTab)
  // Simulated user data - in a real app, this would come from a backend
  const user = {
    name: userData?.user.id,
    profileImage: userData?.user.image,
    joinedDate: "February 2024",
    email: userData?.user.email,
    x: userData?.user.x
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
          image: collection?.image || collection?.raw_image,
          token_id: collection.token_id,
          time: collection.time
        };
      }));

      setCollections(formattedCollections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchUserStat = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:3000/api/getWalletToken", {
        params: {
          owner: address
        },
      });
      
      const formattedCollections = await Promise.all(data.map(async (collection) => {
        return {
          count: collection.count,
          listedCount: collection.listedCount,
          name:collection.contractName,
          image: collection?.collectionImage || "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500" ,
          contractAddress:collection.contractAddress,
          floor:collection.floor,
          value:collection.value
        };
      }));

      setCollectionsStat(formattedCollections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:3000/api/getActivity", {
        params: {
          owner: address,
          limit:100
        },
      });

      console.log(data)

      setUserActivity(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
    // setUserActivity(mockActivity);
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp) => {
     timestamp = new Date(timestamp).getTime();
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );












  







  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="flex">
       {/* Sidebar */}
       <div className={`fixed h-screen bg-gray-800 shadow-xl transition-all duration-300 z-10 ${sidebarOpen ? 'w-96' : 'w-0'}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-10 top-1/2 transform -translate-y-1/2 bg-gray-900 p-2 rounded-r-lg shadow-md hover:bg-gray-800 transition-colors"
          >
           {sidebarOpen ? (
              <ChevronLeft className="w-6 h-6 text-white" />
            ) : (
              <ChevronRight className="w-6 h-6 text-white" />
            )}
          </button>
          
          
          {sidebarOpen && (
            <div className="p-4 h-full overflow-y-auto text-white">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold">Collections</h3>
                </div>
                <input
                  type="text"
                  placeholder="Search collections..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Collection Headers */}
              <div className="grid grid-cols-12 gap-3 px-3 py-2 text-sm text-gray-400 border-b border-gray-700">
                <div className="col-span-5">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Name
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort("floor")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Floor
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort("value")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Value
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="col-span-3">
                  <button
                    onClick={() => handleSort("listedCount")}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Listed
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                {collectionsStat.map((collection) => (
                  <button
                    key={collection.address}
                    onClick={() => setSelectedCollection(collection)}
                    className={`w-full p-3 rounded-lg transition-all grid grid-cols-12 gap-2  items-center bg-purple-900/50`}
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
                      <span className="text-sm font-medium truncate">
                        {collection.name}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-400">
                      {collection?.floor?.toFixed(4)}
                    </div>
                    <div className="col-span-2 text-sm text-gray-400">
                      {collection?.value?.toFixed(4)}
                    </div>
                    <div className="col-span-3 text-sm text-gray-400">
                      {collection.listedCount} / {collection.count}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className="py-12 px-8">
            <div className="max-w-7xl mx-auto">
              {/* Profile Header */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-lg bg-opacity-90">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100">
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                    <div className="flex flex-col md:flex-row items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-purple-600" />
                        <a
                          href={`https://etherscan.io/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono hover:text-purple-600 transition-colors flex items-center gap-1"
                        >
                          {formatAddress(address)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>Joined {user.joinedDate}</span>
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-purple-600" />
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
                            className="hover:text-purple-600"
                          >
                            @{user.x}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg bg-opacity-90">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('collections')}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === 'collections'
                          ? 'border-b-2 border-purple-600 text-purple-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4" />
                      My Collections
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === 'activity'
                          ? 'border-b-2 border-purple-600 text-purple-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      Activity
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                  ) : activeTab === 'collections' ? (
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
                  ) : (
                    <div className="space-y-4">
                      {userActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50"
                        >
                          <div className="p-2 rounded-full bg-purple-100">
                            {activity.type === 'mint' ? (
                              <ImageIcon className="w-5 h-5 text-purple-600" />
                              // <img src=`${activity.collection.image_url}`` alt="" />
                            ) : (
                              <FolderOpen className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">
                              {activity.type === 'mint'
                                ? `Minted NFT #${activity.token_id} ${activity.collection.name} from ${activity.collection}`
                                : `Sold #${activity.token_id} ${activity.collection.name} at  ${activity.price} ${activity.currency}`  }
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTimeAgo(activity.time)}
                            </p>
                          </div>
                        </div>
                      ))}
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