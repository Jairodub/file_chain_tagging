import React, { useState } from 'react';
import axios from 'axios';

const VerificationPage = () => {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputHash, setInputHash] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setVerificationResult(null); // reset result
    setFileHash('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!file && !inputHash) {
      alert('Please select a file or enter a hash to verify.');
      return;
    }

    setLoading(true);

    try {
      let hashToVerify = inputHash;
      
      if (file) {
        // Calculate file hash
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setFileHash(calculatedHash);
        hashToVerify = calculatedHash;
      }

      // For now using a placeholder verification process
      // In a real implementation, you'd verify against your blockchain or backend
      setTimeout(() => {
        setVerificationResult(`✅ Hash ${hashToVerify.slice(0, 16)}... verified successfully (placeholder)`);
        setLoading(false);
      }, 1000);
      
      // Uncomment for actual implementation
      /* 
      const response = await axios.post('http://localhost:8000/verify', {
        hash: hashToVerify
      });
      
      if (response.data.verified) {
        setVerificationResult(`✅ Hash verified successfully. Created at: ${response.data.timestamp}`);
      } else {
        setVerificationResult('❌ Hash not found or verification failed.');
      }
      setLoading(false);
      */
      
    } catch (err) {
      console.error(err);
      setVerificationResult('❌ Error verifying file.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #E5E7EB',
    marginBottom: '1rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out',
    ':focus': {
      borderColor: '#4F46E5',
    }
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)',
    width: '100%'
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111827' }}>
        Verify File Authenticity
      </h2>
      
      <form onSubmit={handleVerify}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#374151'
          }}>
            Upload a file to verify:
          </label>
          <div style={{
            border: '2px dashed #E5E7EB',
            borderRadius: '6px',
            padding: '1.5rem',
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            cursor: 'pointer'
          }}>
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept="*" 
              style={{ display: 'none' }} 
              id="fileInput" 
            />
            <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#9CA3AF" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 14V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <div style={{ fontWeight: '500' }}>
                {file ? file.name : 'Click to select or drag and drop a file here'}
              </div>
              <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Any file type supported
              </div>
            </label>
          </div>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#374151'
          }}>
            Or enter a hash directly:
          </label>
          <input 
            type="text" 
            placeholder="Enter file hash to verify" 
            value={inputHash}
            onChange={(e) => setInputHash(e.target.value)}
            style={inputStyle}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg 
                className="animate-spin" 
                style={{ 
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem' 
                }}
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              Verifying...
            </div>
          ) : 'Verify File'}
        </button>
      </form>

      {fileHash && (
        <div style={{ 
          marginTop: '1.5rem', 
          wordBreak: 'break-all',
          padding: '1rem',
          backgroundColor: '#F3F4F6',
          borderRadius: '6px'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>File SHA-256:</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{fileHash}</div>
        </div>
      )}

      {verificationResult && (
        <div style={{ 
          marginTop: '1.5rem', 
          fontWeight: '500',
          padding: '1rem',
          backgroundColor: verificationResult.includes('✅') ? '#ECFDF5' : '#FEF2F2',
          color: verificationResult.includes('✅') ? '#065F46' : '#B91C1C',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {verificationResult}
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
