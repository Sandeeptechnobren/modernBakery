import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // Turn off warnings for unused variables and any types during build
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      
      // Turn off React Hooks exhaustive-deps warnings
      "react-hooks/exhaustive-deps": "off",
      
      // Turn off unused expressions warnings
      "@typescript-eslint/no-unused-expressions": "off",
      
      // Turn off Next.js img element warnings
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
