import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { client } from './graphql/client.js'
import './index.css'
import { ApolloProvider } from "@apollo/client/react";
import App from './app/App.jsx'


createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)

