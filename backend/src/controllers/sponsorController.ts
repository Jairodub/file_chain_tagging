import { Request, Response } from "express";
import { SponsorService } from "../services/sponsorService";

export class SponsorController {
	private sponsorService: SponsorService;

	constructor() {
		this.sponsorService = new SponsorService();
	}

	public signTransaction = async (
		req: Request,
		res: Response
	): Promise<void> => {
		try {
			console.log("Received sponsor request");
			const { transaction, senderAuthenticator } = req.body;

			if (!transaction || !senderAuthenticator) {
				console.error("Missing required fields:", {
					hasTransaction: !!transaction,
					hasAuthenticator: !!senderAuthenticator,
				});
				res.status(400).json({
					error: "Missing required fields: transaction or senderAuthenticator",
				});
				return;
			}

			const { signedTransaction, feePayerAuthenticatorBytes } =
				await this.sponsorService.signAsFeePayer(
					new Uint8Array(transaction),
					new Uint8Array(senderAuthenticator)
				);

			// Send both signed transaction and fee payer authenticator
			res.status(200).json({
				signedTransaction: Array.from(signedTransaction),
				feePayerAuthenticatorBytes: Array.from(feePayerAuthenticatorBytes),
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			res.status(400).json({
				error: `Failed to sponsor transaction: ${errorMessage}`,
			});
		}
	};

	public signInitUserTransaction = async (
		req: Request,
		res: Response
	): Promise<void> => {
		try {
			console.log("Received sponsor request");
			const { transaction, senderAuthenticator } = req.body;

			if (!transaction || !senderAuthenticator) {
				console.error("Missing required fields:", {
					hasTransaction: !!transaction,
					hasAuthenticator: !!senderAuthenticator,
				});
				res.status(400).json({
					error: "Missing required fields: transaction or senderAuthenticator",
				});
				return;
			}

			const { signedTransaction, feePayerAuthenticatorBytes } =
				await this.sponsorService.signInitUserAsFeePayer(
					new Uint8Array(transaction),
					new Uint8Array(senderAuthenticator)
				);

			// Send both signed transaction and fee payer authenticator
			res.status(200).json({
				signedTransaction: Array.from(signedTransaction),
				feePayerAuthenticatorBytes: Array.from(feePayerAuthenticatorBytes),
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			res.status(400).json({
				error: `Failed to sponsor transaction: ${errorMessage}`,
			});
		}
	};
}
