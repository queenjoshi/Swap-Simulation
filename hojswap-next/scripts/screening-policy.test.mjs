import test from "node:test";
import assert from "node:assert/strict";
import { screeningFailures } from "./screening-policy.mjs";
function report() {
  const data = Object.fromEntries(["is_proxy", "is_mintable", "hidden_owner", "can_take_back_ownership",
    "owner_change_balance", "selfdestruct", "external_call", "is_honeypot", "cannot_buy",
    "cannot_sell_all", "slippage_modifiable", "transfer_pausable", "is_blacklisted", "is_whitelisted",
    "is_anti_whale", "anti_whale_modifiable", "trading_cooldown", "buy_tax", "sell_tax", "transfer_tax"].map(key => [key, "0"]));
  return { ...data, is_open_source: "1", is_in_dex: "1", dex: [{ liquidity: "100000" }] };
}
test("complete clean report is eligible", () => assert.deepEqual(screeningFailures(report()), []));
test("missing report fails closed", () => assert.ok(screeningFailures(null).length));
test("every missing mandatory field fails closed", () => {
  for (const key of Object.keys(report())) {
    const data = report(); delete data[key];
    assert.ok(screeningFailures(data).length, key);
  }
});
test("honeypot and taxes rejected", () => {
  assert.ok(screeningFailures({ ...report(), is_honeypot: "1" }).includes("is_honeypot"));
  for (const tax of ["", "NaN", "-1", "0.01", null, 0]) assert.ok(screeningFailures({ ...report(), buy_tax: tax }).includes("buy_tax"));
});
test("small duplicated pools do not meet liquidity threshold", () => assert.ok(screeningFailures({ ...report(), dex: Array(20).fill({ liquidity: "10000" }) }).length));
