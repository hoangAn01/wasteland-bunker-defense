import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <div
    style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    }}>
    <App />
  </div>,
);
