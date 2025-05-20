import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { FileEntry, FileHistory, FileVerificationResult } from "./types";

export class FileVerificationService {
  private readonly aptos: Aptos;
  private readonly contractAddress: string;

  constructor(contractAddress: string) {
    this.aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));
    this.contractAddress = contractAddress;
  }

  async getFileRecord(owner: string, fileHash: string): Promise<FileEntry> {
    try {
        const result = await this.aptos.view({
          payload: {
            function: `${this.contractAddress}::file_auth_with_registry::get_file_record`,
            typeArguments: [],
            functionArguments: [owner, Array.from(Buffer.from(fileHash, "hex"))]
          }
        });
      const raw = result[0] as Record<string, any>;
      if (!raw?.value) throw new Error("Invalid response format");

      return {
        file_hash: Buffer.from(raw.value.file_hash).toString("hex"),
        root_hash: Buffer.from(raw.value.root_hash).toString("hex"),
        owner: raw.value.owner,
        signer: raw.value.signer,
        timestamp: Number(raw.value.timestamp),
        parent_hash: Buffer.from(raw.value.parent_hash).toString("hex"),
        file_type: raw.value.file_type,
        description: raw.value.description,
        tags: raw.value.tags,
        permission: Number(raw.value.permission)
      };
    } catch (error) {
      throw new Error(`Failed to get file record: ${error}`);
    }
  }

  async verifyAndGetDetails(fileHash: string): Promise<FileVerificationResult> {
    try {
      const isRegistered = await this.isFileRegistered(fileHash);
      if (!isRegistered) {
        return { isRegistered: false };
      }

      const owner = await this.getFileOwnerByHash(fileHash);
      if (!owner) throw new Error("File owner not found");

      const entry = await this.getFileRecord(owner, fileHash);
      const history = await this.getFileHistory(owner, entry.root_hash);

      return {
        isRegistered: true,
        entry,
        history
      };
    } catch (error) {
      console.error("Verification failed:", error);
      return { isRegistered: false };
    }
  }

  private async isFileRegistered(fileHash: string): Promise<boolean> {
    const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::file_auth_with_registry::is_file_registered`,
          typeArguments: [],
          functionArguments: [
            this.contractAddress,
            Array.from(Buffer.from(fileHash, "hex"))
          ]
        }
    });
    return Boolean(result[0]);
  }

  public async getFileOwnerByHash(fileHash: string): Promise<string> {
    const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::file_auth_with_registry::get_file_owner_by_hash`,
          typeArguments: [],
          functionArguments: [
            this.contractAddress,
            Array.from(Buffer.from(fileHash, "hex"))
          ]
        }
    });
    return result[0] as string;
  }
  public async getFileRecordByHash(fileHash: string): Promise<FileEntry> {
    try {
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
            Array.from(Buffer.from(rootHash, "hex"))
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

export const createFileVerificationService = (contractAddress: string): FileVerificationService => 
  new FileVerificationService(contractAddress);