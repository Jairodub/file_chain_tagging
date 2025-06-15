import {
	Aptos,
	AptosConfig,
	Network,
	KeylessAccount,
	Deserializer,
	AccountAuthenticator,
	SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import { FileRegistrationParams } from "./types";

function hexToByteArray(hex: string): number[] {
	// Remove 0x prefix if present
	const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
	// Ensure even length
	const paddedHex = cleanHex.length % 2 ? "0" + cleanHex : cleanHex;
	const bytes: number[] = [];
	for (let i = 0; i < paddedHex.length; i += 2) {
		bytes.push(parseInt(paddedHex.substr(i, 2), 16));
	}
	return bytes;
}

function serializeTransaction(transaction: any): any {
	return JSON.parse(
		JSON.stringify(transaction, (_, value) =>
			typeof value === "bigint" ? value.toString() : value
		)
	);
}

export class FileRegistrationService {
	private readonly aptos: Aptos;
	private readonly contractAddress: string;
	private readonly registryAdmin: string;
	private readonly account: KeylessAccount;

	constructor(
		contractAddress: string,
		registryAdmin: string,
		account: KeylessAccount
	) {
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
					functionArguments: [this.registryAdmin, hexToByteArray(fileHash)],
				},
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
				withFeePayer: true,
				data: {
					function: `${this.contractAddress}::file_auth_with_registry::init_user`,
					functionArguments: [],
				},
			});

			// User signs transaction first
			const senderAuthenticator = await this.aptos.transaction.sign({
				signer: this.account,
				transaction,
			});

			// Send to backend for fee payer signature
			const sponsorResponse = await fetch(
				`${import.meta.env.VITE_API_URL}/api/sponsor/sign`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						transaction: transaction.bcsToBytes(),
						senderAuthenticator: senderAuthenticator.bcsToBytes(),
					}),
				}
			);

			if (!sponsorResponse.ok) {
				throw new Error("Failed to get fee payer signature");
			}

			const { feePayerAuthenticatorBytes, signedTransaction } =
				await sponsorResponse.json();

			// Deserialize both the transaction and fee payer authenticator
			const deserializer = new Deserializer(feePayerAuthenticatorBytes);
			const feePayerAuthenticator =
				AccountAuthenticator.deserialize(deserializer);

			const txDeserializer = new Deserializer(signedTransaction);
			const deserializedTx = SimpleTransaction.deserialize(txDeserializer);

			// Submit with both signatures
			const committedTransaction = await this.aptos.transaction.submit.simple({
				transaction,
				senderAuthenticator,
				feePayerAuthenticator,
			});

			// Wait for completion
			const executedTransaction = await this.aptos.waitForTransaction({
				transactionHash: committedTransaction.hash,
			});

			return executedTransaction.hash;
		} catch (error) {
			console.error("User initialization failed:", error);
			throw error;
		}
	}

	async registerFile(params: FileRegistrationParams): Promise<string> {
		try {
			// Check if file is already registered
			const isRegistered = await this.isFileRegistered(params.fileHash);
			if (isRegistered) {
				throw new Error("File hash already registered");
			}

			// Build the transaction
			const transaction = await this.aptos.transaction.build.simple({
				sender: this.account.accountAddress,
				withFeePayer: true,
				data: {
					function: `${this.contractAddress}::file_auth_with_registry::register_file`,
					functionArguments: [
						hexToByteArray(params.fileHash),
						params.parentHash ? hexToByteArray(params.parentHash) : [],
						params.fileType,
						params.description,
						params.tags,
						params.permission,
						this.registryAdmin,
					],
				},
			});

			// User signs transaction first
			const senderAuthenticator = await this.aptos.transaction.sign({
				signer: this.account,
				transaction,
			});

			// Send to backend for fee payer signature
			const sponsorResponse = await fetch(
				`${import.meta.env.VITE_API_URL}/api/sponsor/sign`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
					body: JSON.stringify({
						transaction: Array.from(transaction.bcsToBytes()), // Convert to regular array
						senderAuthenticator: Array.from(senderAuthenticator.bcsToBytes()),
					}),
				}
			).catch((error) => {
				console.error("Network error:", error);
				throw new Error(`Network request failed: ${error.message}`);
			});

			console.log("Sponsor response:", {
				status: sponsorResponse.status,
				statusText: sponsorResponse.statusText,
			});

			if (!sponsorResponse.ok) {
				throw new Error("Failed to get fee payer signature");
			}

			const { feePayerAuthenticatorBytes, signedTransaction } =
				await sponsorResponse.json();

			// Deserialize both the transaction and fee payer authenticator
			const deserializer = new Deserializer(feePayerAuthenticatorBytes);
			const feePayerAuthenticator =
				AccountAuthenticator.deserialize(deserializer);

			const txDeserializer = new Deserializer(signedTransaction);
			const deserializedTx = SimpleTransaction.deserialize(txDeserializer);

			// Submit transaction with both authenticators
			const committedTransaction = await this.aptos.transaction.submit.simple({
				transaction: deserializedTx,
				senderAuthenticator,
				feePayerAuthenticator,
			});

			// Wait for transaction completion
			const executedTransaction = await this.aptos.waitForTransaction({
				transactionHash: committedTransaction.hash,
			});

			return executedTransaction.hash;
		} catch (error) {
			throw new Error(`File registration failed: ${error}`);
		}
	}
}

export const createFileRegistrationService = (
	contractAddress: string,
	registryAdmin: string,
	account: KeylessAccount
): FileRegistrationService =>
	new FileRegistrationService(contractAddress, registryAdmin, account);
