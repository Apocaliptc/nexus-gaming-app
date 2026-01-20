
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Custom Error Fallback for production debugging
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ 
    height: '100vh', 
    backgroundColor: '#050507', 
    color: '#ef4444', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center',
    fontFamily: 'sans-serif',
    padding: '20px',
    textAlign: 'center'
  }}>
    <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Opa! O Nexus encontrou um erro.</h1>
    <p style={{ color: '#9ca3af', maxWidth: '500px' }}>{error.message}</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Recarregar App
    </button>
  </div>
);

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Nexus: Root element not found");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Nexus initialization error:", err);
    // Fallback UI in case of total crash
    const root = ReactDOM.createRoot(rootElement);
    root.render(<ErrorFallback error={err instanceof Error ? err : new Error('Erro desconhecido')} />);
  }
};

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
