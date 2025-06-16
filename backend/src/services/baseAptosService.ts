// import { AptosClient } from "aptos";

// export class BaseAptosService {
//   protected client: AptosClient;
//   protected contractAddress: string;

//   constructor() {
//     this.client = new AptosClient(process.env.APTOS_NODE_URL || "https://testnet.aptoslabs.com");
//     this.contractAddress = process.env.REGISTRY_ADMIN || "";
//   }

//   protected async submitTransaction(payload: any): Promise<string> {
//     const response = await fetch("https://auth.aptoslabs.com/v1/auth/submit", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         payload,
//         chain: "testnet"
//       })
//     });

//     if (!response.ok) throw new Error("Transaction submission failed");
//     const result = await response.json();
//     await this.client.waitForTransaction(result.hash);
//     return result.hash;
//   }

//   protected async viewResource(payload: any): Promise<any> {
//     return this.client.view(payload);
//   }
// }