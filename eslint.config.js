import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import solid from "eslint-plugin-solid/configs/typescript";
import tseslint from "typescript-eslint";

const files = ["**/*.{ts,tsx}"];

const scoped = (...configs) => configs.flat().map((config) => ({ files, ...config }));

export default [
  { ignores: ["dist/", "coverage/"] },
  ...scoped(
    js.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.recommendedTypeCheckedOnly,
    tseslint.configs.strict,
    solid,
  ),
  {
    files,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...scoped(prettier),
];
