import { defineConfig } from "oxlint"
import { agentToolIgnorePatterns, recommended } from "oxlint-plugin-solzero/config"

export default defineConfig({
  extends: [recommended],
  // A disable comment that suppresses nothing fails lint, so stale suppressions cannot pile up.
  options: { reportUnusedDisableDirectives: "error" },
  plugins: ["unicorn", "typescript", "oxc", "react"],
  jsPlugins: [{ name: "effect", specifier: "@mpsuesser/oxlint-plugin-effect" }],
  ignorePatterns: [
    ...agentToolIgnorePatterns,
    "**/dist/**",
    "**/node_modules/**",
    "**/.wrangler/**",
    "**/.alchemy/**",
    "**/.output/**",
    "**/*.gen.ts",
    "**/tsconfig.json",
    "nub.lock",
    "packages/app/src/registry/**",
    "packages/common/src/db/migrations/**",
    "packages/app/cloudflare-env.d.ts",
  ],
  rules: {
    // tester-army/e2e is the only runner. Reject *.test.* and *.spec.* outside a test directory.
    "solzero/no-colocated-tests": "error",
    // Application code reads config from the worker env or an Effect service.
    // Stack, script, and test files are exempt below.
    "effect/avoid-process-env": "error",
    "effect/avoid-node-imports": "error",
    // Schedule and Effect timing already use duration strings. Keep that shape.
    "effect/prefer-duration-constructors": "error",
    // These already hold. Turn them on so new code cannot drift.
    // Left off, because they do not fit this tree:
    // solzero/no-if-statement and solzero/no-ternary rewrite handlers and charts.
    // solzero/no-return-in-arrow rejects the Drizzle and React callbacks.
    // solzero/prevent-dynamic-imports rejects the Vite plugin imports.
    // solzero/no-manual-effect-channels rejects the runApi callback contract.
    "effect/throw-in-effect-gen": "error",
    "effect/avoid-any": "error",
    "effect/avoid-ts-ignore": "error",
    "effect/avoid-non-null-assertion": "error",
    "effect/prefer-redacted-config": "error",
    "effect/avoid-direct-tag-checks": "error",
    "solzero/no-pipe-ladder": "error",
    "solzero/no-flatmap-ladder": "error",
    "solzero/no-effect-call-in-effect-arg": "error",
    "solzero/no-nested-effect-call": "error",
    "solzero/no-effect-as": "error",
    "solzero/no-option-as": "error",
    "solzero/no-arrow-ladder": "error",
    "solzero/no-branch-in-object": "error",
    "solzero/no-iife-wrapper": "error",
    "solzero/no-effect-never": "error",
    "solzero/no-effect-async": "error",
    "solzero/no-effect-do": "error",
    "solzero/no-effect-bind": "error",
    "solzero/no-nested-effect-gen": "error",
    "solzero/no-match-void-branch": "error",
    "solzero/no-match-effect-branch": "error",
    "solzero/warn-effect-sync-wrapper": "error",
    "solzero/no-effect-side-effect-wrapper": "error",
    "solzero/no-effect-orElse-ladder": "error",
    "solzero/prefer-option-over-null": "error",
    "solzero/avoid-untagged-errors": "error",
  },
  overrides: [
    {
      // TanStack Table v8 returns a new table object from useReactTable on each render, so the
      // React Compiler skips this component. The rule reports that skip, not a defect here.
      files: ["packages/app/src/components/data-table/data-table.tsx"],
      rules: { "react/incompatible-library": "off" },
    },
    {
      // Config files, scripts, the CLI entry, tests, and the Alchemy stack run in Node before an
      // Effect runtime exists. They read process.env and Node modules directly.
      files: [
        "**/*.config.ts",
        "**/scripts/**",
        "src/index.ts",
        "tests/**",
        "packages/infra/src/alchemy.run.ts",
        "packages/infra/src/stack-options.ts",
        "packages/api/infra/index.ts",
        "packages/app/infra/index.ts",
        "packages/common/infra/index.ts",
      ],
      rules: {
        "effect/avoid-process-env": "off",
        "effect/avoid-node-imports": "off",
      },
    },
  ],
})
