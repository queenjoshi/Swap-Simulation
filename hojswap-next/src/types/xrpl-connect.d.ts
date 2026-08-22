declare module "xrpl-connect" {
  import type { Transaction } from "xrpl";

  export type XrplNetwork = "mainnet" | "testnet" | "devnet";
  export type WalletAccount = { address: string; publicKey?: string; network: { id: string; name: string } };
  export type WalletAdapter = { id: string; name: string; icon?: string; url?: string; isAvailable(): Promise<boolean> };

  export class WalletManager {
    constructor(options: { adapters: WalletAdapter[]; network: XrplNetwork; autoConnect?: boolean });
    connect(walletId: string, options?: Record<string, unknown>): Promise<WalletAccount>;
    disconnect(): Promise<void>;
    signAndSubmit(transaction: Transaction): Promise<{ hash?: string; id?: string; tx_blob?: string }>;
    readonly connected: boolean;
    readonly account: WalletAccount | null;
    readonly wallet: WalletAdapter | null;
    readonly wallets: WalletAdapter[];
  }

  export class XamanAdapter implements WalletAdapter {
    constructor(options?: { apiKey?: string });
    id: string; name: string; icon?: string; url?: string; isAvailable(): Promise<boolean>;
  }
  export class CrossmarkAdapter implements WalletAdapter { id: string; name: string; icon?: string; url?: string; isAvailable(): Promise<boolean>; }
  export class GemWalletAdapter implements WalletAdapter { id: string; name: string; icon?: string; url?: string; isAvailable(): Promise<boolean>; }
  export class XyraAdapter implements WalletAdapter { id: string; name: string; icon?: string; url?: string; isAvailable(): Promise<boolean>; }
  export class OtsuAdapter implements WalletAdapter { id: string; name: string; icon?: string; url?: string; isAvailable(): Promise<boolean>; }
  export class LedgerAdapter implements WalletAdapter { id: string; name: string; icon?: string; url?: string; isAvailable(): Promise<boolean>; }
  export class WalletConnectAdapter implements WalletAdapter {
    constructor(options?: {
      projectId?: string;
      themeMode?: "light" | "dark";
      useModal?: boolean;
      modalMode?: "always" | "mobile-only";
      metadata?: { name: string; description: string; url: string; icons: string[] };
    });
    id: string; name: string; icon?: string; url?: string; isAvailable(): Promise<boolean>;
  }
}
