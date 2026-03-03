import Head from 'next/head';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';
import NewsFeed from '~/components/news/NewsFeed';

export default function News() {
  return (
    <>
      <Head>
        <title>Hudson News</title>
        <meta name="description" content="Puryear Gazette - News Feed" />
      </Head>
      <ProtectedRoute requiredRole="viewer">
        <NewsFeed />
      </ProtectedRoute>
    </>
  );
}
