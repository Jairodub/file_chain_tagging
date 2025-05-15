import React, { useState } from 'react';

const VerificationPage = () => {
  const [file, setFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setVerificationResult(null); // reset result
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file.');
      return;
    }

    setLoading(true);

    // Placeholder for hash + verify logic
    setTimeout(() => {
      // simulate API call or local hash
      setVerificationResult('✅ File verified successfully (placeholder)');
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>Verify File Authenticity</h2>
      <form onSubmit={handleVerify}>
        <input type="file" onChange={handleFileChange} accept="*" />
        <br /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify File'}
        </button>
      </form>

      {verificationResult && (
        <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          {verificationResult}
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
