// import { BaseAptosService } from "./baseAptosService";
// import { FileEntry, FileHistory, FileVerificationResult } from "../types/fileTypes";

// export class FileVerificationService extends BaseAptosService {
//   async getFileRecord(owner: string, fileHash: string): Promise<FileEntry> {
//     const payload = {
//       function: `${this.contractAddress}::file_auth_with_registry::get_file_record`,
//       type_arguments: [],
//       arguments: [owner, Array.from(Buffer.from(fileHash, "hex"))]
//     };

//     const result = await this.viewResource(payload);
//     const raw = (result[0] as any).value;

//     return {
//       file_hash: Buffer.from(raw.file_hash).toString("hex"),
//       root_hash: Buffer.from(raw.root_hash).toString("hex"),
//       owner: raw.owner,
//       signer: raw.signer,
//       timestamp: Number(raw.timestamp),
//       parent_hash: Buffer.from(raw.parent_hash).toString("hex"),
//       file_type: raw.file_type,
//       description: raw.description,
//       tags: raw.tags,
//       permission: Number(raw.permission)
//     };
//   }

//   async verifyAndGetDetails(fileHash: string): Promise<FileVerificationResult> {
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

//   private async isFileRegistered(fileHash: string): Promise<boolean> {
//     const result = await this.viewResource({
//       function: `${this.contractAddress}::file_auth_with_registry::is_file_registered`,
//       type_arguments: [],
//       arguments: [
//         this.contractAddress,
//         Array.from(Buffer.from(fileHash, "hex"))
//       ]
//     });
//     return result[0] as boolean;
//   }

//   public async getFileOwnerByHash(fileHash: string): Promise<string> {
//     const result = await this.viewResource({
//       function: `${this.contractAddress}::file_auth_with_registry::get_file_owner_by_hash`,
//       type_arguments: [],
//       arguments: [
//         this.contractAddress,
//         Array.from(Buffer.from(fileHash, "hex"))
//       ]
//     });
//     return result[0] as string;
//   }

//   public async getFileHistory(owner: string, rootHash: string): Promise<FileHistory> {
//     const result = await this.viewResource({
//       function: `${this.contractAddress}::file_auth_with_registry::get_file_history`,
//       type_arguments: [],
//       arguments: [
//         owner,
//         Array.from(Buffer.from(rootHash, "hex"))
//       ]
//     });

//     const data = (result[0] as any).value;
//     return {
//       versions: data.versions.map((v: number[]) => Buffer.from(v).toString("hex"))
//     };
//   }
// }