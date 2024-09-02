import React from 'react';
import {
    BellIcon,
    MenuIcon,
    UserIcon,
} from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md z-20">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button className="text-gray-500 focus:outline-none focus:text-gray-700">
            <MenuIcon className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">Hudson Air Quality Dashboard</h1>
        </div>
        <div className="flex items-center">
          <button className="text-gray-500 focus:outline-none focus:text-gray-700">
            <BellIcon className="h-6 w-6" />
          </button>
          <button className="text-gray-500 focus:outline-none focus:text-gray-700">
            <UserIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header;