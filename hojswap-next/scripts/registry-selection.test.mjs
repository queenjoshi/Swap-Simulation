import test from "node:test";
import assert from "node:assert/strict";
import { selectRegistryPair } from "../src/lib/registry-selection.ts";

const usdc = { chainId: 5042, address: "0x3600000000000000000000000000000000000000", symbol: "USDC", name: "USD Coin", decimals: 6 };
// Fixtures only: not real token-admission recommendations.
const second = { ...usdc, address: "0x0000000000000000000000000000000000000002", symbol: "SECOND" };
const removed = { ...usdc, address: "0x0000000000000000000000000000000000000003", symbol: "REMOVED" };

test("empty registry has no selectable pair", () => {
  assert.equal(selectRegistryPair([], usdc, second), null);
});
test("one-token registry never invents a second asset", () => {
  assert.deepEqual(selectRegistryPair([usdc], usdc, second), { sell: usdc, buy: usdc });
});
test("new admission replaces the same-token Arc default", () => {
  assert.deepEqual(selectRegistryPair([usdc, second], usdc, usdc), { sell: usdc, buy: second });
});
test("existing distinct selection is preserved", () => {
  assert.deepEqual(selectRegistryPair([usdc, second], second, usdc), { sell: second, buy: usdc });
});
test("removed token resets to an active distinct pair", () => {
  assert.deepEqual(selectRegistryPair([usdc, second], removed, second), { sell: usdc, buy: second });
});
test("same address on another chain is not the same registry token", () => {
  assert.deepEqual(selectRegistryPair([usdc, second], { ...second, chainId: 1 }, usdc), { sell: usdc, buy: second });
});
