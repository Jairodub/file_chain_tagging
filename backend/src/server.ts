import express from 'express';

import {EphemeralKeyPair} from '@aptos-labs/ts-sdk';
 
const ephemeralKeyPair = EphemeralKeyPair.generate();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (optional)
app.use(express.json());

// Routes
app.get('/verify', (req, res) => {
  res.send('Confirmed!');
});

app.put('/sign', (req, res) => {
  res.send('Received!');
});

app.post('/hash', (req, res) => {
  res.send('Hashed!');
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
