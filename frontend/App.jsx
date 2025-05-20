import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './src/auth_context';
import { OAuthCallback } from './src/components/OAuthCallback';
import VerificationPage from './src/VerificationPage';
import UploadForm from './src/UploadForm';


function MainContent() {
  const [activeTab, setActiveTab] = useState('upload');
  const { isAuthenticated, userAddress, login, logout } = useAuth();

  const handleAuth = async () => {
    try {
      if (isAuthenticated) {
        await logout();
      } else {
        await login();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem 0.5rem',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#E2E8F0',
      backgroundColor: '#111827',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      marginTop: '2rem',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12), transparent 70%)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        padding: '2.5rem 1rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)'
      }}>
        {/* Auth button */}
        <div style={{ 
          position: 'absolute', 
          top: '1rem', 
          right: '1rem',
          zIndex: 20 
        }}>
          <button
            onClick={handleAuth}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isAuthenticated ? '#10B981' : '#4F46E5',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {isAuthenticated ? 
              `Connected: ${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)} logout?` : 
              'Connect with Keyless'}
          </button>
        </div>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15), transparent 70%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15), transparent 70%)'
        }} />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: '2.4rem',
            fontWeight: '700',
            letterSpacing: '-0.025em',
            background: 'linear-gradient(to right, #E2E8F0, #A5B4FC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            HashProof
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '0.75rem',
            fontSize: '1.1rem'
          }}>
            Securely verify and upload files with <span style={{ color: '#A5B4FC' }}>blockchain technology</span>
          </p>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2rem',
        backgroundColor: '#1E293B',
        padding: '0.75rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}>
        <button 
          onClick={() => setActiveTab('upload')}
          style={{ 
            padding: '0.75rem 1.5rem',
            marginRight: '1rem',
            backgroundColor: activeTab === 'upload' ? '#4F46E5' : 'transparent',
            color: activeTab === 'upload' ? 'white' : '#A5B4FC',
            border: '1px solid ' + (activeTab === 'upload' ? '#4F46E5' : 'rgba(99, 102, 241, 0.2)'),
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'upload' ? '0 0 15px rgba(79, 70, 229, 0.5)' : 'none'
          }}
        >
          Upload File
        </button>
        <button 
          onClick={() => setActiveTab('verify')}
          style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'verify' ? '#4F46E5' : 'transparent',
            color: activeTab === 'verify' ? 'white' : '#A5B4FC',
            border: '1px solid ' + (activeTab === 'verify' ? '#4F46E5' : 'rgba(99, 102, 241, 0.2)'),
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'verify' ? '0 0 15px rgba(79, 70, 229, 0.5)' : 'none'
          }}
        >
          Verify File
        </button>
      </div>

      <div style={{
        backgroundColor: '#1E293B',
        borderRadius: '8px',
        padding: '1.5rem 1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.1), transparent 60%)'
      }}>
        {activeTab === 'upload' && !isAuthenticated ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#A5B4FC' 
          }}>
            <p style={{ marginBottom: '1rem' }}>
              Please connect with Keyless to upload files
            </p>
            <button
              onClick={login}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4F46E5',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Connect to Upload
            </button>
          </div>
        ) : (
          activeTab === 'upload' ? <UploadForm /> : <VerificationPage />
        )}
      </div>
      
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#64748B'
      }}>
        © 2025 HashProof. All rights reserved.
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/" element={<MainContent />} />
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
