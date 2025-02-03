import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // BrowserRouter 추가
import App from './App.jsx';
import './App.css'; // ✅ 추가하기

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* App을 BrowserRouter로 감싸기 */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);
