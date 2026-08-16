/**
 * Jest runs the same TypeScript the app ships, through ts-jest, so a test
 * cannot pass against a type the build would reject.
 *
 * Webpack resolves "@/" and imports CSS and images directly; Jest has to be
 * told about both or every component test fails on an import rather than on
 * anything real.
 */
module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "<rootDir>/src/test/styleMock.ts",
    "\\.(gif|png|jpe?g|svg|webp|avif)$": "<rootDir>/src/test/fileMock.ts",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          jsx: "react-jsx",
          esModuleInterop: true,
          isolatedModules: false,
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/utils/**/*.ts",
    "src/customHooks/**/*.tsx",
    "src/components/**/*.tsx",
    "!src/**/*.test.{ts,tsx}",
  ],
  clearMocks: true,
  restoreMocks: true,
};
