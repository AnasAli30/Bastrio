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
  const [emailChanged, setEmailChanged] = useState(false);
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

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-400">
      <div className="max-w-3xl mx-auto">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-8">Profile Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-light dark:bg-surface-dark transition-all duration-300 ease-out transform group-hover:scale-105">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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
                <label htmlFor="name" className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="Your display name"
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="your@email.com"
                  />
                </div>

                {!emailVerified && emailChanged && (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verifying}
                    className="btn btn-primary mt-2"
                  >
                    {verifying ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify Email"
                    )}
                  </button>
                )}

                {verificationMessage && (
                  <div className={`mt-2 flex items-center ${
                    emailVerified ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  }`}>
                    <span>{verificationMessage}</span>
                  </div>
                )}

                {emailVerified && (
                  <div className="mt-2 flex items-center text-green-500 dark:text-green-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Email Verified</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Social Links</h3>
                
                <div className="relative">
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="input pl-10"
                      placeholder="Twitter username"
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      className="input pl-10"
                      placeholder="Github username"
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input pl-10"
                      placeholder="Your website"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary min-w-[120px] ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>

              {saveStatus === 'success' && (
                <div className="flex items-center text-green-500 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Saved successfully</span>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="flex items-center text-red-500 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>Error saving changes</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}