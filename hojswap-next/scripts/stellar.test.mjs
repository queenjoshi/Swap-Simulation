import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { Account, Asset, Keypair, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";

const require = createRequire(import.meta.url);
const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const text = fs.readFileSync(new URL("../src/lib/" + name + ".ts", import.meta.url), "utf8");
  const js = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "module", "exports", js)(id => id.startsWith("./") ? load(id.slice(2)) : require(id), module, module.exports);
  cache.set(name, module.exports);
  return module.exports;
}
const { stellarAtomic, stellarDecimal, STELLAR_USDC_ISSUER } = load("stellar");
const { reviewedStellarTransaction } = load("stellar-transaction");
test("Stellar amounts round-trip without floating-point loss", () => {
  for (const amount of ["0", "0.0000001", "1.2345678", "922337203685.4775807"]) assert.equal(stellarDecimal(stellarAtomic(amount)), amount);
});
test("invalid precision, negative, scientific and overflowing amounts are rejected", () => {
  for (const amount of ["-1", "1e3", "1.00000001", "922337203685.4775808", "", "Infinity"]) assert.throws(() => stellarAtomic(amount));
});
// Generated keys are used only for offline transaction construction; never funded.
const source = Keypair.random().publicKey(), house = Keypair.random().publicKey();
function fixture(overrides = {}) {
  const quote = { sell: "XLM", buy: "USDC", sellAmount: "10", swapAmount: "9.9", houseFee: "0.1",
    expectedReceive: "1", minimumReceive: "0.99", slippageBps: 100, expiresAt: Date.now() + 60000,
    feeReady: true, houseWallet: house, account: source };
  const transaction = new TransactionBuilder(new Account(source, "1"), { fee: "100", networkPassphrase: Networks.PUBLIC })
    .addOperation(Operation.payment({ destination: house, asset: Asset.native(), amount: overrides.fee ?? "0.1" }))
    .addOperation(Operation.pathPaymentStrictSend({ sendAsset: Asset.native(), sendAmount: "9.9",
      destination: overrides.recipient ?? source, destAsset: new Asset("USDC", STELLAR_USDC_ISSUER), destMin: overrides.minimum ?? "0.99", path: [] }))
    .setTimeout(60).build().toXDR();
  return { ...quote, transaction };
}
const input = { sell: "XLM", buy: "USDC", amount: "10", slippage: 100 };
test("exact fee and protected self-destination swap passes review", () => assert.ok(reviewedStellarTransaction(fixture(), source, input)));
test("changed recipient rejected", () => assert.throws(() => reviewedStellarTransaction(fixture({ recipient: house }), source, input)));
test("changed House fee rejected", () => assert.throws(() => reviewedStellarTransaction(fixture({ fee: "1" }), source, input)));
test("weakened minimum output rejected", () => assert.throws(() => reviewedStellarTransaction(fixture({ minimum: "0.1" }), source, input)));
test("expired and mismatched quotes rejected", () => {
  assert.throws(() => reviewedStellarTransaction({ ...fixture(), expiresAt: 1 }, source, input));
  assert.throws(() => reviewedStellarTransaction(fixture(), source, { ...input, amount: "100" }));
});
