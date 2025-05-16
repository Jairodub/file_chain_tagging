import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
import { AptosClient, AptosAccount, TxnBuilderTypes, BCS, HexString } from "aptos";

const client = new AptosClient("https://fullnode.devnet.aptoslabs.com"); // Use testnet if preferred
const privateKeyHex = process.env.PRIVATE_KEY!; // Store in .env file
const account = new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());

import {EphemeralKeyPair} from '@aptos-labs/ts-sdk';
 
const ephemeralKeyPair = EphemeralKeyPair.generate();

const app = express();
const PORT = process.env.PORT || 3000;


// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });


// Endpoint to handle file upload and hashing - Need to set up storing hash on blockchain.
app.post('/uploadHash', upload.single('file'), (req, res) => {
  if (!upload.single('file')) {
    res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = path.join(__dirname, '..', upload.single('file').path);

  // Read the uploaded file
  fs.readFile(filePath, (err, fileBuffer) => {
    if (err) {
      res.status(500).json({ error: 'Error reading the file.' });
    }

    // Compute SHA-256 hash
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hexHash = hashSum.digest('hex');

    // Optionally, delete the file after hashing
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error deleting the file:', unlinkErr);
      }
    });

    // Return the hash
    res.json({ hash: hexHash });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Middleware (optional)
app.use(express.json());

// Routes
app.get('/verify', (req, res) => {
  res.send('Confirmed!');
});

app.put('/sign', (req, res) => {
  res.send('Received!');
});

// app.post('/hash', (req, res) => {
//   res.send('Hashed!');
// });


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
