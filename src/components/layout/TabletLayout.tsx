import React, { memo, type ReactNode } from 'react';
import Link from 'next/link';

interface TabletLayoutProps {
  children: ReactNode;
}

/** Compact layout optimized for an always-on 8" tablet in landscape. */
const TabletLayout: React.FC<TabletLayoutProps> = memo(({ children }) => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-airq-dark/10 flex flex-col">
      {/* Compact header - 48px instead of 64px */}
      <header className="bg-airq-light border-b border-airq-dark z-20 h-12 flex-shrink-0">
        <div className="flex items-center justify-center h-full px-3">
          <Link href="/dash">
            <h1 className="text-xl text-airq-dark">Hudson Air</h1>
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
});

TabletLayout.displayName = 'TabletLayout';

export default TabletLayout;
