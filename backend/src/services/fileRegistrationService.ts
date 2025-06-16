// import { BaseAptosService } from "./baseAptosService";
// import { FileRegistrationParams } from "../types/fileTypes";

// export class FileRegistrationService extends BaseAptosService {
//   async checkAndInitUser(): Promise<string> {
//     try {
//       const payload = {
//         function: `${this.contractAddress}::file_auth_with_registry::init_user`,
//         type_arguments: [],
//         arguments: []
//       };
//       return await this.submitTransaction(payload);
//     } catch (error) {
//       console.error("User initialization failed:", error);
//       throw error;
//     }
//   }

//   async registerFile(params: FileRegistrationParams): Promise<string> {
//     try {
//       await this.checkAndInitUser().catch(() => console.log("User store exists"));

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

//       return await this.submitTransaction(payload);
//     } catch (error) {
//       console.error("File registration failed:", error);
//       throw error;
//     }
//   }
// }