import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
              Abstrio
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link 
              to="/trending" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <FaChartLine className="text-lg" />
              <span>Heatmap</span>
            </Link>
            
            {/* Add more nav items here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 