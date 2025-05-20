import { Aptos, AptosConfig, Network, KeylessAccount } from "@aptos-labs/ts-sdk";
import { FileRegistrationParams } from "./types";

export class FileRegistrationService {
  private readonly aptos: Aptos;
  private readonly contractAddress: string;
  private readonly account: KeylessAccount;

  constructor(contractAddress: string, account: KeylessAccount) {
    this.aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));
    this.contractAddress = contractAddress;
    this.account = account;
  }

  async checkAndInitUser(): Promise<string> {
    try {
        // Build the transaction
        const transaction = await this.aptos.transaction.build.simple({
          sender: this.account.accountAddress,
          withFeePayer: true,
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
    try {
      // Try to initialize user store first
      await this.checkAndInitUser().catch(() => console.log("User store exists"));

      // Build the transaction
      const transaction = await this.aptos.transaction.build.simple({
        sender: this.account.accountAddress,
        withFeePayer: true,
        data: {
          function: `${this.contractAddress}::file_auth_with_registry::register_file`,
          functionArguments: [
            Array.from(Buffer.from(params.fileHash, "hex")),
            params.parentHash ? Array.from(Buffer.from(params.parentHash, "hex")) : [],
            params.fileType,
            params.description,
            params.tags,
            params.permission,
            this.contractAddress
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
  account: KeylessAccount
): FileRegistrationService => new FileRegistrationService(contractAddress, account);