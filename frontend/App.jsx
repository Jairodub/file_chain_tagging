import React, { useState } from 'react';
import VerificationPage from './src/VerificationPage';
import UploadForm from './src/UploadForm';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#1F2937',
      backgroundColor: '#F9FAFB',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      marginTop: '2rem'
    }}>
      <div style={{
        background: 'linear-gradient(90deg, #4F46E5 0%, #8B5CF6 100%)',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: 'white', 
          margin: 0,
          fontSize: '2.2rem',
          fontWeight: '700',
          letterSpacing: '-0.025em'
        }}>
          File Chain Tagging
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          marginTop: '0.5rem',
          fontSize: '1.1rem'
        }}>
          Securely verify and upload files with blockchain technology
        </p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2rem',
        backgroundColor: 'white',
        padding: '0.75rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <button 
          onClick={() => setActiveTab('upload')}
          style={{ 
            padding: '0.75rem 1.5rem',
            marginRight: '1rem',
            backgroundColor: activeTab === 'upload' ? '#4F46E5' : 'transparent',
            color: activeTab === 'upload' ? 'white' : '#4B5563',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'upload' ? '0 4px 6px -1px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          Upload File
        </button>
        <button 
          onClick={() => setActiveTab('verify')}
          style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'verify' ? '#4F46E5' : 'transparent',
            color: activeTab === 'verify' ? 'white' : '#4B5563',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'verify' ? '0 4px 6px -1px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          Verify File
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        {activeTab === 'upload' ? <UploadForm /> : <VerificationPage />}
      </div>
      
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#6B7280'
      }}>
        © 2025 File Chain Tagging. All rights reserved.
      </div>
    </div>
  );
}

export default App;
