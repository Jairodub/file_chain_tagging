import { Aptos, AptosConfig, Network, KeylessAccount } from "@aptos-labs/ts-sdk";
import { FileRegistrationParams } from "./types";


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



export class FileRegistrationService {
  private readonly aptos: Aptos;
  private readonly contractAddress: string;
  private readonly registryAdmin: string;
  private readonly account: KeylessAccount;

  constructor(contractAddress: string, registryAdmin: string, account: KeylessAccount) {
    this.aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));
    this.contractAddress = contractAddress;
    this.registryAdmin = registryAdmin;
    this.account = account;
  }
  

  private async isFileRegistered(fileHash: string): Promise<boolean> {
    try {
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
    } catch (error) {
      console.error("File registration check failed:", error);
      return false;
    }
  }


  async checkAndInitUser(): Promise<string> {
    try {
        // Build the transaction
        const transaction = await this.aptos.transaction.build.simple({
          sender: this.account.accountAddress,
          data: {
            function: `${this.contractAddress}::file_auth_with_registry::init_user`,
            functionArguments: [],
          },
        });

      // Sign and submit
      const pendingTx = await this.aptos.signAndSubmitTransaction({
        signer: this.account,
        transaction
      });

      // Wait for transaction
      const committedTx = await this.aptos.waitForTransaction({
        transactionHash: pendingTx.hash
      });

      return committedTx.hash;
    } catch (error) {
      console.error("User initialization failed:", error);
      throw error;
    }
  }

  async registerFile(params: FileRegistrationParams): Promise<string> {
  console.log(this.account.accountAddress.data)
    try {
      // Check if file is already registered
      const isRegistered = await this.isFileRegistered(params.fileHash);
      if (isRegistered) {
        throw new Error("File hash already registered");
      }

      // Try to initialize user store first
      await this.checkAndInitUser().catch(() => console.log("User store exists"));
      // Build the transaction
      const transaction = await this.aptos.transaction.build.simple({
        sender: this.account.accountAddress,
        data: {
          function: `${this.contractAddress}::file_auth_with_registry::register_file`,
          functionArguments: [
            hexToByteArray(params.fileHash),
            params.parentHash? hexToByteArray(params.parentHash) : [],
            params.fileType,
            params.description,
            params.tags,
            params.permission,
            this.registryAdmin
          ],
        },
      });

      // Sign and submit
      const pendingTx = await this.aptos.signAndSubmitTransaction({
        signer: this.account,
        transaction
      });

      // Wait for transaction
      const committedTx = await this.aptos.waitForTransaction({
        transactionHash: pendingTx.hash
      });

      return committedTx.hash;
    } catch (error) {
      throw new Error(`File registration failed: ${error}`);
    }
  }
}

export const createFileRegistrationService = (
  contractAddress: string, 
  registryAdmin: string,
  account: KeylessAccount
): FileRegistrationService => new FileRegistrationService(contractAddress, registryAdmin, account);