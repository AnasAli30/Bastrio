import React, { useState } from "react"
import { Link } from "react-router-dom"

export default function Footer() {
  const [year] = useState(new Date().getFullYear());
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // In a real application, you would send this to your backend
      console.log("Subscribing email:", email);
      setSubscribed(true);
      setEmail("");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    }
  };
  
  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 transition-colors duration-400">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h2 className="text-xl sm:text-2xl font-bold text-primary-light dark:text-primary-dark mb-3 sm:mb-4">
              Bastrio
            </h2>
            <p className="text-text-light dark:text-text-dark opacity-75 mb-4 max-w-xs text-sm sm:text-base">
              Discover, collect, and sell extraordinary NFTs on the world's best blockchain platform
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://discord.gg/bastrio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-all duration-300 transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark rounded-full p-1"
                aria-label="Join our Discord community"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/bastrio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-all duration-300 transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark rounded-full p-1"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://instagram.com/bastrio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-all duration-300 transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark rounded-full p-1"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Marketplace Section */}
          <div className="lg:ml-8">
            <h3 className="text-base sm:text-lg font-semibold text-text-light dark:text-text-dark mb-3 sm:mb-4">
              Marketplace
            </h3>
            <nav aria-label="Marketplace Navigation">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/explore"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 text-sm sm:text-base flex items-center"
                  >
                    <span className="relative inline-block">
                      Explore
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-light dark:bg-primary-dark transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trending"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 text-sm sm:text-base flex items-center"
                  >
                    <span className="relative inline-block">
                      Trending
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-light dark:bg-primary-dark transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 text-sm sm:text-base flex items-center"
                  >
                    <span className="relative inline-block">
                      Create
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-light dark:bg-primary-dark transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* My Account Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-text-light dark:text-text-dark mb-3 sm:mb-4">
              My Account
            </h3>
            <nav aria-label="Account Navigation">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/profile"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 text-sm sm:text-base flex items-center"
                  >
                    <span className="relative inline-block">
                      Profile
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-light dark:bg-primary-dark transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 text-sm sm:text-base flex items-center"
                  >
                    <span className="relative inline-block">
                      Settings
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-light dark:bg-primary-dark transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/favorites"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 text-sm sm:text-base flex items-center"
                  >
                    <span className="relative inline-block">
                      Favorites
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-light dark:bg-primary-dark transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Newsletter Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-text-light dark:text-text-dark mb-3 sm:mb-4">
              Stay Updated
            </h3>
            <p className="text-text-light dark:text-text-dark opacity-75 mb-4 text-sm">
              Subscribe to our newsletter for the latest updates and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label htmlFor="email-input" className="sr-only">Email address</label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark text-text-light dark:text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
        
        {/* Legal Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <p className="text-center md:text-left text-text-light dark:text-text-dark opacity-75 text-sm">
              © {year} Bastrio. All rights reserved.
            </p>
            <nav aria-label="Legal Navigation">
              <ul className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
                <li>
                  <Link 
                    to="/terms"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark text-sm transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/privacy"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark text-sm transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/cookies"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark text-sm transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact"
                    className="text-text-light dark:text-text-dark opacity-75 hover:opacity-100 hover:text-primary-light dark:hover:text-primary-dark text-sm transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
