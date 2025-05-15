import React, { useState } from "react";
import axios from "axios";

//.jpg, .pdf, . PNG
export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [parentHash, setParentHash] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setStatus("");
    }
  };

  const handleUpload = async () => {
    if (!file) return setStatus("Please select a file first.");

    setLoading(true);

    try {
      // Read and hash the file
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hexHash);

      // Ask user to sign with Petra (optional for backend auth)
      const aptos = window.aptos;
      if (!aptos) {
        setStatus("Aptos wallet not found. Please install Petra.");
        setLoading(false);
        return;
      }

      const sender = await aptos.account();
      const response = await axios.post("http://localhost:8000/hash", {
        hash: hexHash,
        parent_hash: parentHash || null,
        signer: sender.address
      });

      if (response.data.success) {
        setStatus("✅ File hash stored successfully on-chain.");
      } else {
        setStatus("⚠️ Failed to store hash.");
      }
      
    } catch (err) {
      console.error(err);
      setStatus("❌ Error uploading file.");
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

  return (
    <div>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: '600', 
        marginBottom: '1.5rem', 
        color: '#E2E8F0'
      }}>
        Upload File for Authenticity Hash
      </h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '500',
          color: '#A5B4FC'
        }}>
          Select file to upload:
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
            style={{ display: 'none' }} 
            id="uploadFileInput" 
          />
          <label htmlFor="uploadFileInput" style={{ cursor: 'pointer' }}>
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
          Parent Hash (optional):
        </label>
        <input
          type="text"
          placeholder="Enter parent hash for creating file chains"
          value={parentHash}
          onChange={(e) => setParentHash(e.target.value)}
          style={inputStyle}
        />
        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
          Enter the hash of a parent file to create verifiable relationships between files
        </div>
      </div>

      <button
        onClick={handleUpload}
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
            Uploading...
          </div>
        ) : 'Upload to Blockchain'}
      </button>

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

      {status && (
        <div style={{ 
          marginTop: '1.5rem', 
          fontWeight: '500',
          padding: '1rem',
          backgroundColor: status.includes('✅') ? 'rgba(6, 78, 59, 0.2)' : status.includes('⚠️') ? 'rgba(202, 138, 4, 0.2)' : 'rgba(185, 28, 28, 0.2)',
          color: status.includes('✅') ? '#10B981' : status.includes('⚠️') ? '#FBBF24' : '#EF4444',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          border: status.includes('✅') ? '1px solid rgba(16, 185, 129, 0.3)' : status.includes('⚠️') ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: status.includes('✅') ? '0 0 15px rgba(16, 185, 129, 0.2)' : status.includes('⚠️') ? '0 0 15px rgba(251, 191, 36, 0.2)' : '0 0 15px rgba(239, 68, 68, 0.2)'
        }}>
          {status}
        </div>
      )}
    </div>
  );
}
