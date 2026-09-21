// Integration tests against an already running local app. No transactions are submitted.
import test from "node:test";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3217";
const valid = { chainId: 5042, sellToken: "0x3600000000000000000000000000000000000000",
  buyToken: "0xbef5f6d51cb62b58e6a8f77868681825c6fe21c1", sellAmount: "17952",
  slippageBps: 100, taker: "0x69bf308e5e30158072cf9d2c6de7b86f5ae2f9b4" };
for (const [name, body] of [
  ["null body", null], ["negative amount", { ...valid, sellAmount: "-1" }],
  ["overflow amount", { ...valid, sellAmount: String(2n ** 256n) }],
  ["same tokens", { ...valid, buyToken: valid.sellToken }],
  ["excessive slippage", { ...valid, slippageBps: 501 }],
  ["missing wallet", { ...valid, taker: undefined }],
  ["unsupported chain", { ...valid, chainId: 99999999 }],
]) test(name + " rejected", async () => {
  const response = await fetch(base + "/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "invalid_swap");
});
test("Arc catalog is registry authoritative", async () => {
  const response = await fetch(base + "/api/token-catalog?chainId=5042");
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.source, "registry");
  assert.equal(data.registryEnforced, true);
  assert.ok(Array.isArray(data.tokens));
});
test("unregistered random address cannot be quoted", async () => {
  const response = await fetch(base + "/api/quote", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...valid, buyToken: "0x0000000000000000000000000000000000000001" }) });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "registry_check_failed");
});
