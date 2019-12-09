module.exports = {
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"],
  "roots": [
    "<rootDir>"
  ],
  "setupTestFrameworkScriptFile": "./jest.setup.js",
  "testPathIgnorePatterns": ["src/.*"],
  "testRegex": "/__tests__/.*.test.ts$",
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
}
