import React, {
  ReactNode,
} from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-default-textLight relative">
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="h-full-no-header flex-1 overflow-x-hidden overflow-y-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;