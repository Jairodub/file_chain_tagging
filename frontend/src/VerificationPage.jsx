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

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>Verify File Authenticity</h2>
      
      <form onSubmit={handleVerify}>
        <div style={{ marginBottom: '1rem' }}>
          <p>Upload a file to verify:</p>
          <input type="file" onChange={handleFileChange} accept="*" />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <p>Or enter a hash directly:</p>
          <input 
            type="text" 
            placeholder="Enter file hash to verify" 
            value={inputHash}
            onChange={(e) => setInputHash(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Verifying...' : 'Verify File'}
        </button>
      </form>

      {fileHash && (
        <div style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
          <strong>File SHA-256:</strong> {fileHash}
        </div>
      )}

      {verificationResult && (
        <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          {verificationResult}
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
