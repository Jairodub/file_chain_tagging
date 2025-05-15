import React, { useState } from "react";
import axios from "axios";

//.jpg, .pdf, . PNG
export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [parentHash, setParentHash] = useState("");
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setStatus("");
    }
  };

  const handleUpload = async () => {
    if (!file) return setStatus("Please select a file first.");

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
    }
  };

  return (
    <div className="p-4 rounded-xl border w-full max-w-md mx-auto mt-6 bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload File for Authenticity Hash</h2>

      <input type="file" onChange={handleFileChange} className="mb-3" />
      
      <input
        type="text"
        placeholder="Parent Hash"
        value={parentHash}
        onChange={(e) => setParentHash(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Upload 
      </button>

      {fileHash && (
        <div className="mt-3 text-sm break-all">
          <strong>SHA-256:</strong> {fileHash}
        </div>
      )}

      {status && <div className="mt-2 text-sm">{status}</div>}
    </div>
  );
}
