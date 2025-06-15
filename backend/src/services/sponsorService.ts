import {
	Aptos,
	AptosConfig,
	Network,
	Account,
	Ed25519PrivateKey,
	AnyRawTransaction,
	PrivateKey,
	PrivateKeyVariants,
	Deserializer,
	SimpleTransaction,
} from "@aptos-labs/ts-sdk";

import dotenv from "dotenv";

dotenv.config();

export class SponsorService {
	private aptos: Aptos;
	private feePayerAccount: Account;

	constructor() {
		this.aptos = new Aptos(
			new AptosConfig({
				network: Network.TESTNET,
			})
		);

		const privateKeyHex = process.env.SPONSOR_PRIVATE_KEY;
		if (!privateKeyHex) {
			throw new Error("SPONSOR_PRIVATE_KEY not found in environment variables");
		}

		// Format the private key to be AIP-80 compliant
		const formattedKey = PrivateKey.formatPrivateKey(
			privateKeyHex,
			PrivateKeyVariants.Ed25519
		);
		const sponsorKey = new Ed25519PrivateKey(formattedKey);
		this.feePayerAccount = Account.fromPrivateKey({ privateKey: sponsorKey });
	}

	public async signAsFeePayer(
		transaction: Uint8Array,
		senderAuthenticator: Uint8Array
	) {
		try {
			console.log("at sponsor service");

			// await this.validateTransaction(transaction, senderAuthenticator);
			// console.log("transaction validated");

			try {
				// Convert Uint8Array to Buffer if needed
				const buffer = Buffer.from(transaction);
				const deserializer = new Deserializer(buffer);

				// Log deserialization progress
				console.log("Deserializing transaction...");
				const deserializedTx = SimpleTransaction.deserialize(deserializer);
				console.log("Transaction deserialized successfully");

				// Build a new transaction with the same parameters
				// const reconstructedTx = await this.aptos.transaction.build.simple({
				// 	sender: rawTransaction.sender,
				// 	data: {function:rawTransaction.payload},
				// 	options: {
				// 		maxGasAmount: rawTransaction.max_gas_amount,
				// 		gasUnitPrice: rawTransaction.gas_unit_price,
				// 		expiration: rawTransaction.expiration_timestamp_secs,
				// 	},
				// 	withFeePayer: true,
				// });

				// Sign as fee payer
				const feePayerAuthenticator =
					await this.aptos.transaction.signAsFeePayer({
						signer: this.feePayerAccount,
						transaction: deserializedTx,
					});

				console.log("sponsor signed successfully");

				return {
					signedTransaction: Array.from(deserializedTx.bcsToBytes()),
					feePayerAuthenticatorBytes: Array.from(
						feePayerAuthenticator.bcsToBytes()
					),
				};
			} catch (signingError) {
				console.error("Failed to sign as fee payer:", {
					error:
						signingError instanceof Error
							? signingError.message
							: "Unknown error",
					stack: signingError instanceof Error ? signingError.stack : undefined,
				});
				throw signingError;
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			console.error("Sponsor service error:", errorMessage);
			throw new Error(`Sponsor signing failed: ${errorMessage}`);
		}
	}

	public async signInitUserAsFeePayer(
		transaction: Uint8Array,
		senderAuthenticator: Uint8Array
	) {
		try {

			try {
				// Convert Uint8Array to Buffer if needed
				const buffer = Buffer.from(transaction);
				const deserializer = new Deserializer(buffer);

				const deserializedTx = SimpleTransaction.deserialize(deserializer);
				console.log("Transaction deserialized successfully");


				// Sign as fee payer
				const feePayerAuthenticator =
					await this.aptos.transaction.signAsFeePayer({
						signer: this.feePayerAccount,
						transaction: deserializedTx,
					});

				console.log("sponsor signed successfully");

				return {
					signedTransaction: Array.from(deserializedTx.bcsToBytes()),
					feePayerAuthenticatorBytes: Array.from(
						feePayerAuthenticator.bcsToBytes()
					),
				};
			} catch (signingError) {
				console.error("Failed to sign as fee payer:", {
					error:
						signingError instanceof Error
							? signingError.message
							: "Unknown error",
					stack: signingError instanceof Error ? signingError.stack : undefined,
				});
				throw signingError;
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			console.error("Sponsor service error:", errorMessage);
			throw new Error(`Sponsor signing failed: ${errorMessage}`);
		}
	}

	private async validateTransaction(
		transaction: AnyRawTransaction,
		senderAuthenticator: any
	): Promise<void> {
		console.log("Validating transaction...");

		if (!transaction) {
			throw new Error("Transaction is missing");
		}

		if (!senderAuthenticator) {
			throw new Error("Sender authenticator is missing");
		}
	
		// Add more validation as needed
	}

	private async validateInitUserTransaction(
		transaction: AnyRawTransaction,
		senderAuthenticator: any
	): Promise<void> {
		// Add init user specific validation
		if (!transaction || !senderAuthenticator) {
			throw new Error("Invalid init user transaction or sender authenticator");
		}
		// Add more validation as needed
	}
}
