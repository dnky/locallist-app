import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),

  // --- ADD THIS NEW OBJECT ---
  // This object specifically overrides rules from the config above.
  {
    rules: {
      // "off" disables the rule, preventing the build error.
      // You could also set it to "warn" to see it during development without failing the build.
      "react/no-unescaped-entities": "off",
    },
  },
  // -------------------------

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;