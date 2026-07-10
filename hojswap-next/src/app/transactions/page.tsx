import type { Metadata } from "next";
import { TransactionsPageClient } from "@/components/TransactionsPageClient";

export const metadata: Metadata = {
  title: "Transactions - House of Joshi",
  description:
    "View Hojswap transaction history across supported chains with direct explorer links.",
};

export default function TransactionsPage() {
  return <TransactionsPageClient />;
}
