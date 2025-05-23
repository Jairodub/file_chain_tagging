import React, { useState } from 'react';
import VerificationPage from './src/VerificationPage';
import UploadForm from './src/UploadForm';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

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
        {activeTab === 'upload' ? <UploadForm /> : <VerificationPage />}
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

export default App;
