import { SelfBackendVerifier, InMemoryConfigStore, ATTESTATION_ID } from '@selfxyz/core';

// Configuration for Self Protocol
// In a real app, these would come from environment variables
export const SELF_SCOPE = process.env.NEXT_PUBLIC_SELF_SCOPE || 'aegis-confidential';
export const SELF_CALLBACK_URL = process.env.NEXT_PUBLIC_SELF_CALLBACK_URL || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/self/callback`;

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
   * Returns the configuration for the Self QR code component
   */
  getQRConfig() {
    return {
      appName: 'Aegis Confidential Concierge',
      scope: SELF_SCOPE,
      endpoint: SELF_CALLBACK_URL,
      claims: ['passport', 'id_card'], // Requesting passport or ID card verification
      attestationIds: [ATTESTATION_ID.PASSPORT, ATTESTATION_ID.BIOMETRIC_ID_CARD]
    };
  }

  /**
   * Helper to format proof data for on-chain verification if needed
   */
  formatProofForChain(proof: any) {
    // This would transform the proof from the Self mobile app into the format required by AegisAgentRegistry.sol
    // based on ISelfAgentRegistry.sol
    return {
      a: proof.a,
      b: proof.b,
      c: proof.c,
      pubSignals: proof.pubSignals
    };
  }
}

export const selfService = SelfService.getInstance();
