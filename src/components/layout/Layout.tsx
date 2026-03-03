import React, {
  memo,
  type ReactNode,
} from 'react';
import Header from './Header';
import { useIsNewsSite } from '~/hooks/useIsNewsSite';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const isNews = useIsNewsSite();
  return (
    <div className={`h-screen w-screen overflow-hidden ${isNews ? 'blueprint' : 'stairs'} flex flex-col`}>
      <Header />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;