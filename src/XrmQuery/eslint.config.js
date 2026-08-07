import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    // The ambient contract and the XDT-shaped test fixture are declaration-only. `XQW.Guid` has to
    // stay a global namespace: generated `_Select` interfaces reference it by that name.
    files: ["src/globals.ts", "tests/fixtures/**/*.d.ts", "tests/xdt-compat/typings/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-namespace": "off",
    },
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // Type-level assertions bind queries only to read their types back off.
    files: ["tests/types.test.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
