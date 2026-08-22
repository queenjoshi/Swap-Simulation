import { createClient } from "@solana/kit";
import { walletSigner } from "@solana/kit-plugin-wallet";

export const solanaClient = createClient().use(
  walletSigner({
    chain: "solana:mainnet",
    storageKey: "hojswap:solana-wallet",
  }),
);
