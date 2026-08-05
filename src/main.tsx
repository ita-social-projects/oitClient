import { queryClient } from '@shared/query/queryClient';
import { ForumOfflineIndicator } from '@shared/realtime/ForumOfflineIndicator';
import { ForumRealtimeProvider } from '@shared/realtime/ForumRealtimeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import './i18n.ts';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ForumRealtimeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ForumOfflineIndicator />
      </ForumRealtimeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
