import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 80 }
  }
};

export default config;
