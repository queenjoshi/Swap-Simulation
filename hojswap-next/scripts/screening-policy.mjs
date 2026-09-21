// Conservative admission policy, not a guarantee or audit.
export function screeningFailures(report) {
  if (!report || typeof report !== "object") return ["security_report_missing"];
  const failures = [];
  for (const key of ["is_open_source", "is_in_dex"]) {
    if (report[key] !== "1") failures.push(key);
  }
  for (const key of ["is_proxy", "is_mintable", "hidden_owner", "can_take_back_ownership",
    "owner_change_balance", "selfdestruct", "external_call", "is_honeypot", "cannot_buy",
    "cannot_sell_all", "slippage_modifiable", "transfer_pausable", "is_blacklisted",
    "is_whitelisted", "is_anti_whale", "anti_whale_modifiable", "trading_cooldown"]) {
    if (report[key] !== "0") failures.push(key);
  }
  for (const key of ["buy_tax", "sell_tax", "transfer_tax"]) {
    if (typeof report[key] !== "string" || !/^0(?:\.0+)?$/.test(report[key])) failures.push(key);
  }
  const pools = Array.isArray(report.dex) ? report.dex : [];
  // Require one sufficiently liquid pool; do not sum duplicated pool entries.
  if (!pools.some(pool => Number.isFinite(Number(pool.liquidity)) && Number(pool.liquidity) >= 100000)) failures.push("liquidity_below_100000_usd_or_unknown");
  return failures;
}
