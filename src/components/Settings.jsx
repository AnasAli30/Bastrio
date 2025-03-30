import React, { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Twitter, 
  Loader2, 
  CheckCircle, 
  AlertCircle
} from "lucide-react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useUserContext } from "../context/UserContext";
import axios from "axios";

export default function Settings() {
  const { userData } = useUserContext();
  const user = userData?.user;
  const [emailPending, setEmailPending] = useState(false);

  const { address } = useAppKitAccount();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
    twitter: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.id || "",
        email: user?.email || "",
        twitter: user?.x || "",
        profileImage: user?.image || "",
      });
      setEmailVerified(user?.isVerified || false);
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "email") {
      setEmailVerified(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifying(true);
    setEmailPending(false); // Reset before request
    try {
      const response = await axios.post("http://localhost:3000/api/signup", {
        email: formData.email,
        address,
      });
  
      if (response.status === 200) {
        setEmailPending(true); // Show "Check your email" message
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      console.error("Email verification error:", error);
    }
    setVerifying(false);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus("idle");

    try {
      let token = localStorage.getItem("token");
      await axios.post(`http://localhost:3000/api/update?accountAddress=${address}`, {
        token,
        name: formData.name,
        email: formData.email,
        x: formData.twitter,
        image: formData.profileImage,
      });

      setSaveStatus("success");
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
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
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100">
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
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
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Your display name"
                  />
                </div>
              </div>

              {/* Email Input + Verify Button */}
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
                    disabled={emailVerified}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Verify Email Button */}
                {!emailVerified && formData.email && !emailPending && (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verifying}
                    className="mt-2 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all"
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
                {!emailVerified && emailPending && (
  <div className="mt-2 text-green-600">
    Verification email sent! Please check your inbox.
  </div>
)}


                {emailVerified &&  (
                  <div className="mt-2 flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Email Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              {saveStatus === "success" && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Settings saved successfully!</span>
                </div>
              )}
              {saveStatus === "error" && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>Error saving settings.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white transition-all ${
                  loading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
