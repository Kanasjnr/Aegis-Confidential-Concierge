import { ATTESTATION_ID } from "@selfxyz/core";
import { SelfAppBuilder } from "@selfxyz/qrcode";
import { MOCK_SELF_REGISTRY_ADDRESS, SELF_HUB_ADDRESS } from "./contracts";

// Configuration for Self Protocol
export const SELF_SCOPE =
  process.env.NEXT_PUBLIC_SELF_SCOPE || "aegis-confidential";

/**
 * Service to handle Self Protocol ZK-Identity verification
 */
export class SelfService {
  private static instance: SelfService;

  private constructor() {}

  static getInstance(): SelfService {
    if (!SelfService.instance) {
      SelfService.instance = new SelfService();
    }
    return SelfService.instance;
  }

  /**
   * Returns the configuration for the Self QR code component using the Builder pattern
   */
  getQRConfig(userId: string) {
    // Force 0x prefix and lowercase for consistency
    let formattedUserId =
      userId || "0x0000000000000000000000000000000000000000";
    if (!formattedUserId.startsWith("0x")) {
      formattedUserId = `0x${formattedUserId}`;
    }
    formattedUserId = formattedUserId.toLowerCase();

    return new SelfAppBuilder({
      version: 2,
      appName: "Aegis",
      scope: "aegis",
      // Point back to our mock registry which now has submitProof
      endpoint: MOCK_SELF_REGISTRY_ADDRESS,
      endpointType: "staging_celo",
      userId: formattedUserId,
      userIdType: "hex",
      devMode: true,
      logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
      disclosures: {},
    }).build();
  }

  /**
   * Helper to format proof data for on-chain verification
   */
  formatProofForChain(proof: any) {
    return {
      a: proof.a,
      b: proof.b,
      c: proof.c,
      pubSignals: proof.pubSignals,
    };
  }
}

export const selfService = SelfService.getInstance();
