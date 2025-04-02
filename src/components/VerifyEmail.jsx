import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post("http://localhost:3000/api/verify-email", null, {
          params: { token },
        });

        if (response.data.message === "Email verified successfully") {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  const statusConfig = {
    loading: {
      icon: <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />,
      title: "Verifying Your Email",
      message: "Please wait while we confirm your email address...",
      className: "text-blue-500"
    },
    success: {
      icon: <CheckCircle className="w-16 h-16 text-green-500" />,
      title: "Email Verified!",
      message: "Your email has been successfully verified. You can now close this window.",
      className: "text-green-500"
    },
    error: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: "Verification Failed",
      message: "The verification link is invalid or has expired. Please request a new verification email.",
      className: "text-red-500"
    }
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-6 transform transition-all duration-500 hover:shadow-xl">
          <div className="flex justify-center">
            {currentStatus.icon}
          </div>
          
          <div className="space-y-2">
            <h2 className={`text-2xl font-bold ${currentStatus.className}`}>
              {currentStatus.title}
            </h2>
            <p className="text-gray-600">
              {currentStatus.message}
            </p>
          </div>

          {status === "error" && (
            <button 
              onClick={() => window.location.href = "/"}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Return to Homepage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}