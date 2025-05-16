# 🔐 HashProof

In a world overwhelmed by fake news, unauthorized reuse, and content theft, HashProof offers a decentralized solution for establishing trust, authorship, and integrity — without storing actual media on-chain.

HashProof is a file verification and provenance system that leverages the Aptos blockchain to enable on-chain tracking of off-chain files. It provides a middleware architecture where file hashes are stored immutably on-chain, allowing for authenticity checks, version control, and digital ancestry tracing—like a DNA tagging system for files.

**Use Case:** Ever wanted to know if a file has been altered, who signed it, or where it came from? HashProof lets developers and users cryptographically trace the origin and integrity of media (PDFs, images, audio, wave, etc.).

  > Creators & Influencers: Securely register music, videos, images, and documents to prevent content theft and prove originality when monetizing.

  > Label Companies: Maintain a tamper-proof archive of artist catalogs with on-chain tracking of updates or derivatives.

  > Social Media Platforms (e.g., YouTube, IG): Integrate HashProof to verify media origins, prevent unauthorized reposts, and add legitimacy watermarks to uploaded content.

  > News & Media Orgs: Combat misinformation by verifying content authenticity before it’s shared. For example, IG news posts could include a verified origin tag, ensuring the source is credible.

<img width="1288" alt="image" src="https://github.com/user-attachments/assets/409035fa-57e0-4ae9-8158-9f66507def2b" />

---

## 🌐 Architecture Overview

project-root/
│
├── backend/                       # Python FastAPI/Flask API
│   ├── main.py                    # Routes:
│   │   ├─ POST /hash              # Upload + hash file
│   │   ├─ POST /sign              # Sign hash with user's Aptos key
(use keyless )
│   │   └─ GET /verify             # Verify if hash exists on-chain
│   └── utils/                     # File hashing, Aptos TX signing utils
│
├── frontend/                      # React/Vite UI
│   ├── src/
│   │   ├─ UploadForm.jsx          # Upload and hash file
│   │   ├─ VerificationPage.jsx    # Enter hash or file to verify
│   │   └─ useWallet()             # Integrate Aptos wallet (e.g., Petra)
│   └── public/
│
├── contracts/
│   └── media_auth.move            # Move module:
│       ├─ store_auth(hash, signer, parent_hash, timestamp)
│       ├─ verify(hash) → bool
│       └─ get_lineage(hash) → vector<parent_hash>
│
├── docker-compose.yml            # Launch backend, frontend, local devnet
├── Dockerfile.backend            # FastAPI server container
├── Dockerfile.frontend           # Vite/React app container
└── README.md                     # Overview, setup, usage

---

## 🚀 Features

- ✅ Upload and hash any file (PDF, PNG, JPG, etc.)
- 🔗 Push cryptographic hash + metadata to Aptos
- 🪪 Tracks signer, parent version hash, and upload time
- 🧾 Provides tamper-proof audit trail for files
- 🔍 Verify if a file was altered or its origin

---

## 🛠️ Tech Stack

- **Frontend**: React.js / Vite
- **Backend**: Node.js + Express + TypeScript
- **Blockchain**: Aptos + Move Smart Contracts
- **Hashing**: SHA-256 (via Node crypto or browser)
- **Off-chain Storage**: Local or IPFS (optional)
- **Dev Tools**: Docker, ts-node-dev

---

## ⚙️ Setup Instructions

### 1. Clone the repo

git clone https://github.com/your-username/hashproof.git
cd hashproof

### 2. Setup Backend
cd backend
npm install
npm run dev

### 3. Setup Frontend
cd ../frontend
npm install
npm run dev

### 4. Setup Frontend
cd ../contracts
aptos init  # if not already initialized
aptos move compile
aptos move publish --profile default


