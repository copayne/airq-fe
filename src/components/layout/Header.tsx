import React from 'react';
import {
    BellIcon,
    MenuIcon,
    UserIcon,
} from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-default-textLight shadow-md z-20">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button className="text-default-dark hover:text-default-contrast focus:outline-none">
            <MenuIcon className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-default-textDark">Hudson Air Quality</h1>
        </div>
        <div className="flex items-center">
          <button className="text-default-dark hover:text-default-contrast focus:outline-none">
            <BellIcon className="h-6 w-6" />
          </button>
          <button className="text-default-dark hover:text-default-contrast focus:outline-none">
            <UserIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header;