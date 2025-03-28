import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { 
  User, 
  Wallet, 
  Image as ImageIcon, 
  Activity, 
  FolderOpen, 
  ExternalLink, 
  Clock,
  Loader2
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collections');
  const [userActivity, setUserActivity] = useState([]);

  // Simulated user data - in a real app, this would come from a backend
  const user = {
    name: userData.user.id,
    profileImage: userData.user.image,
    joinedDate: "February 2024"
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchUserCollections();
      fetchUserActivity();
    }
  }, [address, isConnected]);

  const fetchUserCollections = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(walletProvider);
      const contract = new ethers.Contract(marketplaceContract, NFT_COLLECTION_ABI, provider);

      // This is a placeholder - adjust based on your actual contract method
      const userCollections = await contract.getUserCollections(address);
      
      const formattedCollections = await Promise.all(userCollections.map(async (collection) => {
        const metadataCID = collection.metadataURI.replace("ipfs://", "");
        return {
          address: collection.contractAddress,
          name: collection.name,
          image: `https://gateway.lighthouse.storage/ipfs/${metadataCID}/preview.png`,
          totalSupply: collection.totalSupply.toString(),
          mintedCount: collection.mintedCount.toString()
        };
      }));

      setCollections(formattedCollections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    // Simulated activity data - replace with actual blockchain events in production
    const mockActivity = [
      {
        type: "mint",
        collection: "CryptoPunks",
        tokenId: "1234",
        timestamp: Date.now() - 3600000,
      },
      {
        type: "create",
        collection: "My Collection",
        timestamp: Date.now() - 86400000,
      },
      // Add more activity items as needed
    ];
    setUserActivity(mockActivity);
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
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
                {collections.map((collection, index) => (
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
                          <span>{collection.mintedCount} / {collection.totalSupply}</span>
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
                      ) : (
                        <FolderOpen className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        {activity.type === 'mint'
                          ? `Minted NFT #${activity.tokenId} from ${activity.collection}`
                          : `Created collection ${activity.collection}`}
                      </p>
                      <p className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}