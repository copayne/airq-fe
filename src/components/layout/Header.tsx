import React, { memo } from 'react';
import {
  Menu,
} from 'lucide-react';

const Header: React.FC = memo(() => {
  return (
    <header className="bg-default-textLight border-b-default-dark border-b-[1px] z-20 h-16 drop-shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button className="text-default-textDark hover:text-default-contrast focus:outline-none">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-default-textDark">hudson air quality</h1>
        </div>
      </div>
    </header>
  )
});

Header.displayName = 'Header';

export default Header;