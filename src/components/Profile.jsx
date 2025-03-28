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
  Mail,
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

  const user = {
    name: userData?.user.id,
    profileImage: userData?.user.image,
    joinedDate: "February 2024",
    email: userData?.user.email,
    x: userData?.user.x
  };

  useEffect(() => {
    if (isConnected && address) {
      // fetchUserCollections();
      // fetchUserActivity();
    }
  }, [address, isConnected]);

  const fetchUserCollections = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(walletProvider);
      const contract = new ethers.Contract(marketplaceContract, NFT_COLLECTION_ABI, provider);

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

  const formatAddress = (addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-lg bg-opacity-90">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100">
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <div className="flex flex-col md:flex-row items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-600" />
                  <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer" className="font-mono hover:text-purple-600 flex items-center gap-1">
                    {formatAddress(address)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Joined {user.joinedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span>{user.email}</span>
                </div>
                {user.x && (
                  <div className="flex items-center gap-2">
                    <img src="https://img.freepik.com/premium-vector/new-twitter-logo-x-2023-twitter-x-logo-official-vector-download_691560-10797.jpg?semt=ais_hybrid" alt="X" className="w-5 h-5" />
                    <a href={`https://twitter.com/${user.x}`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">
                      @{user.x}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
