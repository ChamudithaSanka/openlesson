export default {
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  testMatch: ["**/*.test.js"],
  collectCoverageFrom: [
    "src/controllers/**/*.js",
    "src/utils/**/*.js",
    "src/middleware/**/*.js",
    "!src/tests/**"
  ],
  coverageDirectory: "coverage",
  verbose: true,
  testPathIgnorePatterns: ["/node_modules/", "/src/tests/performance/"]
};
