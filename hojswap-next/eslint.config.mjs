import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Blockchain SDK responses and generated UI primitives contain dynamic
      // provider shapes that cannot be usefully narrowed at every boundary.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // Swap/bridge effects intentionally reset stale quote state when their
      // network inputs change; the React 19 heuristic flags these transitions.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
      // Generated UI skeleton widths are intentionally randomized once.
      "react-hooks/purity": "off",
      // Dynamic token and wallet images can be data URIs or remote URLs that
      // should not be sent through the Next image optimizer.
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
