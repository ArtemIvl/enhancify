import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './services/AuthContext.jsx'
import 'flag-icons/css/flag-icons.min.css';
import './index.css'
import App from './App.jsx'
import "../node_modules/flag-icons/css/flag-icons.min.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
