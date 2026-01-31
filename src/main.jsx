import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Handle SPA routing from 404.html redirect
const redirectPath = sessionStorage.getItem('spa_redirect');
if (redirectPath && redirectPath !== '/') {
  sessionStorage.removeItem('spa_redirect');
  window.history.replaceState(null, '', redirectPath);
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
