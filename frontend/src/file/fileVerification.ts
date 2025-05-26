import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { FileEntry, FileHistory, FileVerificationResult } from "./types";

function isValidHex(hex: string): boolean {
    return /^(0x)?[0-9a-fA-F]+$/.test(hex);
  }

function hexToByteArray(hex: string): number[] {
    // Remove 0x prefix if present
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    // Ensure even length
    const paddedHex = cleanHex.length % 2 ? '0' + cleanHex : cleanHex;
    const bytes: number[] = [];
    for (let i = 0; i < paddedHex.length; i += 2) {
      bytes.push(parseInt(paddedHex.substr(i, 2), 16));
    }
    return bytes;
}
  
function uint8ArrayToHex(arr: Uint8Array | number[]): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}


export class FileVerificationService {
  private readonly aptos: Aptos;
  private readonly contractAddress: string;
  private readonly registryAdmin: string;

  constructor(contractAddress: string, registryAdmin: string) {
    if (!contractAddress) {
        throw new Error('Contract address is required');
      }

    this.registryAdmin = registryAdmin;
    this.aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));
    this.contractAddress = contractAddress;
  }

//   async getFileRecord(owner: string, fileHash: string): Promise<FileEntry> {
//     console.log("getting file record")
//     try {
//         const result = await this.aptos.view({
//           payload: {
//             function: `${this.contractAddress}::file_auth_with_registry::get_file_record`,
//             typeArguments: [],
//             functionArguments: [owner,hexToByteArray(fileHash)]
//           }
//         });
//       // Debug log the raw response
//       console.log("Raw response:", JSON.stringify(result, null, 2));

//       // The Aptos view function returns the data directly, no need for .value
//         const record = result[0] as any;
//         if (!record) throw new Error("No record returned");
//         const timestamp = Number(record.timestamp) * 1000;
//         return {
//             file_hash: uint8ArrayToHex(record.file_hash),
//             root_hash: uint8ArrayToHex(record.root_hash),
//             owner: record.owner,
//             signer: record.signer,
//             timestamp: timestamp,
//             parent_hash: uint8ArrayToHex(record.parent_hash),
//             file_type: record.file_type,
//             description: record.description,
//             tags: record.tags,
//             permission: Number(record.permission)
//         };
//     } catch (error) {
//         console.error("Get file record error:", error);
//         throw new Error(`Failed to get file record: ${error}`);
//     }
// }

private async isFileRegistered(fileHash: string): Promise<boolean> {
  const result = await this.aptos.view({
      payload: {
        function: `${this.contractAddress}::file_auth_with_registry::is_file_registered`,
        typeArguments: [],
        functionArguments: [
          this.registryAdmin,
          hexToByteArray(fileHash)
        ]
      }
  });
  return Boolean(result[0]);
}

  public async getFileOwnerByHash(fileHash: string): Promise<string> {
    const bytes = hexToByteArray(fileHash)
    const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::file_auth_with_registry::get_file_owner_by_hash`,
          typeArguments: [],
          functionArguments: [
            this.registryAdmin,
            bytes
          ]
        }
    });
    return result[0] as string;
  }
  public async getFileRecordByHash(fileHash: string): Promise<FileEntry> {
    try {
        if (!isValidHex(fileHash)) {
            throw new Error('Invalid hex format');
        }
        // First check if file exists in registry
        const isRegistered = await this.isFileRegistered(fileHash);
        if (!isRegistered) {
            throw new Error('File not found in registry');
        }
        const owner = await this.getFileOwnerByHash(fileHash);
        if (!owner) throw new Error("File owner not found");

        const record = await this.getFileRecord(owner, fileHash);
        return record;
    } catch (error) {
      throw new Error(`Failed to get file record by hash: ${error}`);
    }
  }

  public async getFileHistory(owner: string, rootHash: string): Promise<FileHistory> {
   
    const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::file_auth_with_registry::get_file_history`,
          typeArguments: [],
          functionArguments: [
            owner,
            hexToByteArray(rootHash)
          ]
        }
    });

    const data = result[0] as Record<string, any>;
    if (!data?.value?.versions) throw new Error("Invalid history format");

    return {
      versions: data.value.versions.map((v: number[]) => Buffer.from(v).toString("hex"))
    };
  }
}

export const createFileVerificationService = (contractAddress: string, registryAdmin: string): FileVerificationService => 
  new FileVerificationService(contractAddress, registryAdmin);