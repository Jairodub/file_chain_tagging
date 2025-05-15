import React, { useState } from 'react';
import VerificationPage from './src/VerificationPage';
import UploadForm from './src/UploadForm';

function App() {
  const [activeTab, setActiveTab] = useState('verify');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>File Chain Tagging</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
      <button 
          onClick={() => setActiveTab('upload')}
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'upload' ? '#4F46E5' : '#E5E7EB',
            color: activeTab === 'upload' ? 'white' : 'black',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Upload File
        </button>

        <button 
          onClick={() => setActiveTab('verify')}
          style={{ 
            padding: '0.5rem 1rem', 
            marginRight: '1rem',
            backgroundColor: activeTab === 'verify' ? '#4F46E5' : '#E5E7EB',
            color: activeTab === 'verify' ? 'white' : 'black',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Verify File
        </button>
        
      </div>

      {activeTab === 'verify' ? <VerificationPage /> : <UploadForm />}
    </div>
  );
}

export default App;
