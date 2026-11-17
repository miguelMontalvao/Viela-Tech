import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// A abertura (definida no index.html) dura ~2 s; depois a cortina sai do DOM e a rolagem volta.
if (document.documentElement.classList.contains('com-intro')) {
  setTimeout(() => {
    document.documentElement.classList.remove('com-intro');
    document.getElementById('intro')?.remove();
  }, 2100);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
