import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from '../layout/Layout';
import FeedSidebar from './FeedSidebar';
import ItemList from './ItemList';
import { useRSS } from '~/context/RSSContext';

const NewsFeed: React.FC = () => {
  const { state, initialize } = useRSS();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  // Show auth error / loading before RSS is ready
  if (!state.isInitialized) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-airq-dark/40" />
        </div>
      </Layout>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="bg-airq-light/95 rounded border-airq-dark border p-6 max-w-sm text-center">
            <p className="text-sm font-mono text-airq-dark/60">
              {state.error ?? 'FreshRSS not configured. Set NEXT_PUBLIC_FRESHRSS_URL, NEXT_PUBLIC_FRESHRSS_USER, and NEXT_PUBLIC_FRESHRSS_API_PASSWORD.'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex justify-center sm:px-6 sm:py-2 md:px-12 md:py-4">
        {/* Sidebar — desktop only */}
        <div className="hidden sm:block w-full h-full overflow-hidden sm:max-w-[250px] sm:bg-airq-light/95 sm:mr-2 sm:rounded sm:border-airq-dark sm:border pt-3">
          <FeedSidebar />
        </div>

        {/* Main panel — always visible */}
        <div className="flex w-full max-w-[1700px] h-full bg-airq-light/95 sm:rounded sm:border-airq-dark sm:border overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <ItemList />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewsFeed;
