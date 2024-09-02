import React, {
  ReactNode,
} from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-700 to-neutral-900 relative">
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;