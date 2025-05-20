"use client"

import { memo } from 'react';
import { PageContent } from '@/lib/supabase';
import { PageContentDisplay } from './page-content';
import { useAuth } from '@/lib/auth-context';

export const PageContentClient = memo(function PageContentClient({ content }: { content: PageContent }) {
  const { isAuthenticated, userId, loading } = useAuth();
  
  if (loading) {
    return <div>Yükleniyor...</div>;
  }
  
  return <PageContentDisplay content={content} isAuthenticated={isAuthenticated} userId={userId || undefined} />;
}); 