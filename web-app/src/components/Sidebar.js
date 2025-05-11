import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ buttons }) => {
  const location = useLocation();  // Get the current location to highlight the active page

  return (
    <div className="w-1/4 bg-gray-100 p-4 h-screen">
      {/* Render the buttons passed as props */}
      {buttons.map((button, index) => (
        <Link
          key={index}
          to={button.path}  // Navigate to the respective route
          className={`block p-3 mb-2 rounded text-lg font-medium transition-all ${
            location.pathname === button.path
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-700 hover:bg-green-200'
          }`}
        >
          {button.label}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
