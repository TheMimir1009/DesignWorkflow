import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * React 19 진입점
 * StrictMode로 개발 중 잠재적 문제 감지
 */
function render() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// 테스트 환경에서는 자동 실행 방지
if (import.meta.env.MODE !== 'test') {
  render();
}

export { render };
