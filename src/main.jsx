// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { client } from './configs/client.config.js'; // Apollo (nếu vẫn dùng)
import './index.css';
import { ApolloProvider } from '@apollo/client/react';
import App from './app/App.jsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { queryClient } from './configs/query-client.config.js';
import { GOOGLE_CLIENT_ID } from './configs/google-client.config';
import reactArrayToTree from 'react-array-to-tree';


const Provider = reactArrayToTree([
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{null}</GoogleOAuthProvider>,
  <QueryClientProvider client={queryClient}>{null}</QueryClientProvider>,
  <ApolloProvider client={client}>{null}</ApolloProvider>
])

// render app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>
);
