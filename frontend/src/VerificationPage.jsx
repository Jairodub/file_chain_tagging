import React, { useState } from 'react';
import { format } from 'date-fns';
import { createFileVerificationService } from './file/fileVerification';;

const fileVerificationService = createFileVerificationService(
  import.meta.env.VITE_CONTRACT_ADDRESS,
  import.meta.env.VITE_REGISTRY_ADMIN
);
const isValidHex = (hex) => /^[0-9a-fA-F]+$/.test(hex);

const FileRecord = {
  hash: '',
  parent_hash: null,
  signer: '',
  fileType: '',
  description: '',
  tags: [],
  permission: '',
  timestamp: '',
};
const VerificationPage = () => {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputHash, setInputHash] = useState('');
  const [fileRecord, setFileRecord] = useState(null);

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

    // Validate hex input
  if (inputHash && !isValidHex(inputHash)) {
    setVerificationResult('❌ Invalid hash format. Please enter a valid hexadecimal value.');
    return;
  }

    setLoading(true);
    setFileRecord(null);
    setVerificationResult(null);

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

      if (!isValidHex(hashToVerify)) {
        throw new Error('Invalid hash format');
      }

      const record = await fileVerificationService.getFileRecordByHash(hashToVerify);
    
    if (record) {
      setFileRecord(record);
      setVerificationResult('✅ File verified successfully');
    } else {
      setVerificationResult('❌ File not found in records');
    }
  } catch (err) {
    console.error('Verification error:', err);
    setVerificationResult('❌ File not found or verification failed');
  } finally {
    setLoading(false);
  }
};
   

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    marginBottom: '1rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    color: '#E2E8F0',
    boxSizing: 'border-box',
    maxWidth: '100%',
    overflowX: 'hidden',
    textOverflow: 'ellipsis'
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
    boxShadow: '0 0 10px rgba(79, 70, 229, 0.4)',
    width: '100%',
    background: 'linear-gradient(to right, #4F46E5, #7C3AED)'
  };

  const FileDetails = ({ record }) => (
    <div style={{ 
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '8px',
      border: '1px solid rgba(99, 102, 241, 0.3)'
    }}>
      <h3 style={{ 
        color: '#A5B4FC',
        marginBottom: '1rem',
        fontSize: '1.2rem',
        fontWeight: '600'
      }}>
        File Record Details
      </h3>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        <DetailRow label="File Type" value={record.file_type} />
        <DetailRow label="Description" value={record.description} />
        <DetailRow label="Tags" value={record.tags.join(', ')} />
        <DetailRow label="Permission" value={record.permission.toString()} />
        <DetailRow label="Owner" value={record.owner} monospace />
        <DetailRow label="Signer" value={record.signer} monospace />
        <DetailRow 
          label="Parent Hash" 
          value={record.parent_hash || 'None'} 
          monospace
        />
        <DetailRow 
          label="Root Hash" 
          value={record.root_hash} 
          monospace
        />
        <DetailRow 
          label="Timestamp" 
          value={format(new Date(record.timestamp), 'PPpp')}
        />
      </div>
    </div>
  );
  
  const DetailRow = ({ label, value, monospace = false }) => (
    <div>
      <div style={{ 
        color: '#A5B4FC',
        fontSize: '0.875rem',
        marginBottom: '0.25rem'
      }}>
        {label}:
      </div>
      <div style={{ 
        color: '#E2E8F0',
        fontSize: '0.925rem',
        fontFamily: monospace ? 'monospace' : 'inherit',
        padding: '0.5rem',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '4px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        wordBreak: 'break-all'
      }}>
        {value}
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: '600', 
        marginBottom: '1.5rem', 
        color: '#E2E8F0',
        display: 'flex',
        alignItems: 'center' 
      }}>
        <svg 
          style={{ marginRight: '0.75rem' }} 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
            stroke="#A5B4FC" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        Verify File Authenticity
      </h2>
      
      <form onSubmit={handleVerify}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#A5B4FC'
          }}>
            Upload a file to verify:
          </label>
          <div style={{
            border: '1px dashed rgba(99, 102, 241, 0.5)',
            borderRadius: '6px',
            padding: '1.5rem',
            textAlign: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'inset 0 0 10px rgba(99, 102, 241, 0.1)'
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
                  stroke="#A5B4FC" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 14V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <div style={{ fontWeight: '500', color: '#E2E8F0' }}>
                {file ? file.name : 'Click to select or drag and drop a file here'}
              </div>
              <div style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Any file type supported
              </div>
            </label>
          </div>
        </div>
        
        <div style={{ marginBottom: '1.5rem', width: '100%' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#A5B4FC'
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
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '6px',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#A5B4FC' }}>File SHA-256:</div>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.875rem', 
            color: '#E2E8F0',
            padding: '0.75rem',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '4px',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            {fileHash}
          </div>
        </div>
      )}

      {verificationResult && (
        <div style={{ 
          marginTop: '1.5rem', 
          fontWeight: '500',
          padding: '1rem',
          backgroundColor: verificationResult.includes('✅') ? 'rgba(6, 78, 59, 0.2)' : 'rgba(185, 28, 28, 0.2)',
          color: verificationResult.includes('✅') ? '#10B981' : '#EF4444',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          border: verificationResult.includes('✅') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: verificationResult.includes('✅') ? '0 0 15px rgba(16, 185, 129, 0.2)' : '0 0 15px rgba(239, 68, 68, 0.2)'
        }}>
          {verificationResult}
        </div>
      )}

      {fileRecord && <FileDetails record={fileRecord} />}
      
    </div>
  );
};

export default VerificationPage;
