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
  const { userData } = useUserContext();
  const user = userData.user;
  const { address } = useAppKitAccount();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
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
        name: user.id,
        email:user.email,
        twitter:user.x,
        profileImage:user.image,
      }));
    }
    if(address){
      fetch()
    }
  },[address])

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 transition-transform duration-300 ease-out transform group-hover:scale-105">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white text-sm font-medium">Change Photo</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Your display name"
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>

              {["twitter"].map((field, index) => {
                const icons = {
                  twitter: Twitter,
               
                };
                const Icon = icons[field];

                return (
                  <div className="relative" key={index}>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder={`Enter your ${field}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <div className="flex-1">
                {saveStatus === 'success' && (
                  <div className="flex items-center text-green-600 animate-fade-in">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Settings saved successfully!</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center text-red-600 animate-fade-in">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>Error saving settings. Please try again.</span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 transform ${
                  loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
