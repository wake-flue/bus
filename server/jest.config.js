module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/appConfig.js',
    '!src/config/**/*.js',
    '!src/middleware/swaggerConfig.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js']
}; 