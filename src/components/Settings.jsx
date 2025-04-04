import React, { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Twitter, 
  Github, 
  Globe, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  MessageSquare 
} from "lucide-react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useUserContext } from "../context/UserContext";
import axios from "axios";


export default function Settings() {
  
 const [emailPending, setEmailPending] = useState(false);
  const { userData } = useUserContext();
  const user = userData?.user;
  const { address } = useAppKitAccount();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  const [emailVerified, setEmailVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false); //
  const [verificationMessage, setVerificationMessage] = useState(""); 

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
    twitter: "",
    github: "",
    instagram: "",
    website: ""
  });

  useEffect(()=>{
    const fetch =async ()=>{
      setFormData(prev => ({
        ...prev,
        name: user?.id,
        email:user?.email,
        twitter:user?.x,
        profileImage:user?.image,
      }));
setEmailVerified(user?.isVerified)
setInitialEmail(user?.email || "");  // 📌 Set the initial email
    }
    if(address){
      fetch()
    }
  },[userData])

  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      const response = await axios.post("http://localhost:3000/api/signup", {
        email: formData.email,
        address,
      });

      
      if (response.status==200) {
        console.log(response)
        setVerificationMessage("✅ Verification email sent successfully! check your inbox");
      } else {
        throw new Error(response.data.message || "Verification failed.");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setVerificationMessage(
        error.response?.data?.message || "❌ An error occurred. Please try again."
      ); // 📢 Display error message
    } finally {
      setVerifying(false);
    }
  };


  const handleImageUpload = async(e) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      const formData = new FormData();
      formData.append("image", file);
      try {
        const response = await axios.post("http://localhost:3000/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.imageUrl) {
          setFormData(prev => ({
            ...prev,
            profileImage: response.data.imageUrl
          }));
        }
      } catch (error) {
        toast.error("Error uploading image");
        console.error("Error uploading image:", error);
      }


    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus('idle');
    console.log(formData)

    try {
      let accountAddress = address;
      let token = localStorage.getItem('token')
      const updateData = await axios.post(
        `http://localhost:3000/api/update?accountAddress=${accountAddress}`,
        { token ,name:formData.name,email:formData.email,x:formData.twitter,image:formData.profileImage}
      );
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaveStatus('success');


    } catch (error) {
      console.log(error)
      setSaveStatus('error');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" && value !== user?.email) {
      setEmailChanged(true);
      setEmailVerified(false)
    }

    

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortCollections = (collections) => {
    return [...collections].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;
      return (aValue - bValue) * modifier;
    });
  };

  const filteredAndSortedCollections = sortCollections(
    collections.filter(collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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

  rreturn (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed h-screen bg-white shadow-xl transition-all duration-300 z-10 ${sidebarOpen ? 'w-[400px]' : 'w-0'}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-10 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-r-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-600" />
            )}
          </button>
          
          {sidebarOpen && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Collections</h3>
                </div>
                <input
                  type="text"
                  placeholder="Search collections..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Collection Headers */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-sm font-medium text-gray-600 border-b border-gray-200">
                <div className="col-span-5">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-purple-600"
                  >
                    Name
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort("floor")}
                    className="flex items-center gap-1 hover:text-purple-600"
                  >
                    Floor
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort("value")}
                    className="flex items-center gap-1 hover:text-purple-600"
                  >
                    Value
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="col-span-3">
                  <button
                    onClick={() => handleSort("listedCount")}
                    className="flex items-center gap-1 hover:text-purple-600"
                  >
                    Listed
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 mt-2">
                {filteredAndSortedCollections.map((collection) => (
                  <button
                    key={collection.address}
                    onClick={() => setSelectedCollection(collection)}
                    className={`w-full p-3 rounded-lg transition-all grid grid-cols-12 gap-2 items-center ${
                      selectedCollection?.address === collection.address
                        ? 'bg-purple-50 border border-purple-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40?text=NFT";
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {collection.name}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {collection.floor.toFixed(4)}
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {collection.value.toFixed(4)}
                    </div>
                    <div className="col-span-3 text-sm text-gray-600">
                      {collection.listedCount} / {collection.totalCount}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[400px]' : 'ml-0'}`}>
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
                            <p className="text-sm text-gray-500">
                              {formatTimeAgo(activity.timestamp)}
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