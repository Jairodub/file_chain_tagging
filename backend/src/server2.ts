// import express from 'express';
// import multer from 'multer';
// import crypto from 'crypto';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import { AptosClient, AptosAccount, HexString } from 'aptos';
// import { FileRegistrationService, FileVerificationService } from './services/aptosService';

// dotenv.config();

// // Set up Aptos client and account
// const privateKeyHex = process.env.PRIVATE_KEY!;
// const account = new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());
// const client = new AptosClient("https://testnet.aptoslabs.com");

// // Services
// const fileRegService = new FileRegistrationService();
// const fileVerifyService = new FileVerificationService();

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.json());

// // Configure multer
// const upload = multer({ dest: 'uploads/' });

// export async function handleFileUploadAndRegistration(req: any) {
//   if (!req.file) {
//     throw new Error('No file uploaded.');
//   }

//   const filePath = path.join(__dirname, '..', req.file.path);

//   // Read file buffer and hash it
//   const fileBuffer = fs.readFileSync(filePath);
//   const hashSum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

//   // Clean up uploaded file
//   fs.unlinkSync(filePath);

//   // Extract body fields
//   const { fileType, description, tags, permission } = req.body;

//   const registrationParams = {
//     fileHash: hashSum,
//     parentHash: undefined,
//     fileType: fileType || 'generic',
//     description: description || 'Uploaded via API',
//     tags: tags ? tags.split(',') : [],
//     permission: Number(permission) || 0
//   };

//   // Register file on-chain
//   const txHash = await fileRegService.registerFile(registrationParams);

//   return {
//     message: 'File registered successfully',
//     txHash,
//     hash: hashSum
//   };
// }

// /**
//  * POST /uploadAndRegister
//  * - Upload a file
//  * - Hash it
//  * - Register the file hash on Aptos blockchain
//  */
// app.post('/uploadAndRegister', upload.single('file'), async (req, res) => {
//   try {
//     const result = await handleFileUploadAndRegistration(upload.single('file'));
//     res.json(result);
//   } catch (error) {
//     console.error('Upload/Register error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// /**
//  * GET /verify/:fileHash
//  * - Check if a hash is registered
//  * - Fetch metadata + history
//  */
// app.get('/verify/:fileHash', async (req, res) => {
//   const { fileHash } = req.params;
//   try {
//     const result = await fileVerifyService.verifyAndGetDetails(fileHash);
//     res.json(result);
//   } catch (error) {
//     console.error('Verification failed:', error);
//     res.status(500).json({ error: 'Verification failed.' });
//   }
// });

// //TODO: check or simple test route
// app.get('/verify', (_req, res) => {
//   res.send('Confirmed!');
// });

// app.put('/sign', (_req, res) => {
//   res.send('Received!');
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running at http://localhost:${PORT}`);
// });
