// import { AptosClient } from "aptos";

// // Interfaces
// export interface FileEntry {
//   file_hash: string;
//   root_hash: string;
//   owner: string;
//   signer: string;
//   timestamp: number;
//   parent_hash: string;
//   file_type: string;
//   description: string;
//   tags: string[];
//   permission: number;
// }

// export interface FileHistory {
//   versions: string[];
// }

// export interface FileRegistrationParams {
//   fileHash: string;
//   parentHash?: string;
//   fileType: string;
//   description: string;
//   tags: string[];
//   permission: number;
// }

// // Registration Service
// export class FileRegistrationService {
//   private client: AptosClient;
//   private contractAddress: string;

//   constructor() {
//     this.client = new AptosClient("https://testnet.aptoslabs.com");
//     this.contractAddress = process.env.REGISTRY_ADMIN || "";
//   }

//   async checkAndInitUser(): Promise<string> {
//     try {
//       const payload = {
//         function: `${this.contractAddress}::file_auth_with_registry::init_user`,
//         type_arguments: [],
//         arguments: []
//       };
//       const response = await fetch("https://auth.aptoslabs.com/v1/auth/submit", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           payload,
//           chain: "testnet"
//         })
//       });
//       if (!response.ok) throw new Error("User initialization failed");
//       const result = await response.json();
//       await this.client.waitForTransaction(result.hash);
//       return result.hash;
//     } catch (error) {
//       console.error("User initialization failed:", error);
//       throw error;
//     }
//   }

//   async registerFile(params: FileRegistrationParams): Promise<string> {
//     try {
//       try {
//         await this.checkAndInitUser();
//         console.log("User store initialized");
//       } catch {
//         console.log("User store already exists");
//       }

//       const payload = {
//         function: `${this.contractAddress}::file_auth_with_registry::register_file`,
//         type_arguments: [],
//         arguments: [
//           Array.from(Buffer.from(params.fileHash, "hex")),
//           params.parentHash ? Array.from(Buffer.from(params.parentHash, "hex")) : [],
//           params.fileType,
//           params.description,
//           params.tags,
//           params.permission,
//           this.contractAddress
//         ]
//       };

//       const response = await fetch("https://auth.aptoslabs.com/v1/auth/submit", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           payload,
//           chain: "testnet"
//         })
//       });

//       if (!response.ok) throw new Error("Transaction submission failed");
//       const result = await response.json();
//       await this.client.waitForTransaction(result.hash);
//       return result.hash;
//     } catch (error) {
//       console.error("File registration failed:", error);
//       throw error;
//     }
//   }
// }

// // Verification Service
// export class FileVerificationService {
//   private client: AptosClient;
//   private contractAddress: string;

//   constructor() {
//     this.client = new AptosClient("https://testnet.aptoslabs.com");
//     this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || "";
//   }

//   async getFileRecord(owner: string, fileHash: string): Promise<FileEntry> {
//     const payload = {
//       function: `${this.contractAddress}::file_auth_with_registry::get_file_record`,
//       type_arguments: [],
//       arguments: [owner, Array.from(Buffer.from(fileHash, "hex"))]
//     };
//     const result = await this.client.view(payload);
// // result = [{ type: "...", value: { file_hash: ..., ... } }]
//     const raw = (result[0] as any).value;

//     return {
//     file_hash: Buffer.from(raw.file_hash).toString("hex"),
//     root_hash: Buffer.from(raw.root_hash).toString("hex"),
//     owner: raw.owner,
//     signer: raw.signer,
//     timestamp: Number(raw.timestamp),
//     parent_hash: Buffer.from(raw.parent_hash).toString("hex"),
//     file_type: raw.file_type,
//     description: raw.description,
//     tags: raw.tags,
//     permission: Number(raw.permission)
//     };
//   }

//  async getFileHistory(owner: string, rootHash: string): Promise<FileHistory> {
//   const payload = {
//     function: `${this.contractAddress}::file_auth_with_registry::get_file_history`,
//     type_arguments: [],
//     arguments: [
//       owner,
//       Array.from(Buffer.from(rootHash, 'hex'))
//     ]
//   };

//   const result = await this.client.view(payload);
//   const data = (result[0] as any).value;

//   return {
//     versions: data.versions.map((v: number[]) => Buffer.from(v).toString('hex'))
//   };
// }


//  async getFileOwnerByHash(fileHash: string): Promise<string> {
//   const payload = {
//     function: `${this.contractAddress}::file_auth_with_registry::get_file_owner_by_hash`,
//     type_arguments: [],
//     arguments: [
//       this.contractAddress,
//       Array.from(Buffer.from(fileHash, 'hex'))
//     ]
//   };

//   const result = await this.client.view(payload);
//   return result[0] as string; // Correctly extract string from MoveValue[]
// }

//   async isFileRegistered(fileHash: string): Promise<boolean> {
//   const payload = {
//     function: `${this.contractAddress}::file_auth_with_registry::is_file_registered`,
//     type_arguments: [],
//     arguments: [
//       this.contractAddress,
//       Array.from(Buffer.from(fileHash, 'hex'))
//     ]
//   };

//   const result = await this.client.view(payload);
//   return result[0] as boolean; // Extract the boolean from the array
// }

//   async verifyAndGetDetails(fileHash: string): Promise<{
//     isRegistered: boolean;
//     entry?: FileEntry;
//     history?: FileHistory;
//   }> {
//     const isRegistered = await this.isFileRegistered(fileHash);
//     if (!isRegistered) {
//       return { isRegistered: false };
//     }
//     const owner = await this.getFileOwnerByHash(fileHash);
//     const entry = await this.getFileRecord(owner, fileHash);
//     const history = await this.getFileHistory(owner, entry.root_hash);
//     return {
//       isRegistered: true,
//       entry,
//       history
//     };
//   }
// }
