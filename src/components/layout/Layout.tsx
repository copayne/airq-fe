import React, {
  memo,
  type ReactNode,
} from 'react';
import Header from './Header';
import { useCurrentSite } from '~/hooks/useCurrentSite';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const site = useCurrentSite();
  const bgPattern = site === 'news' ? 'blueprint' : site === 'security' ? 'fiber' : 'stairs';
  const themeClass = site === 'security' ? 'theme-security' : '';
  return (
    <div className={`h-screen w-screen overflow-hidden ${bgPattern} ${themeClass} flex flex-col`}>
      <Header />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;