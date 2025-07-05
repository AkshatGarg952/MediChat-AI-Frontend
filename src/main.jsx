import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import DocumentChatLanding from './components/LandPage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocumentChatLanding />} />
        <Route path="/mainPage" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
