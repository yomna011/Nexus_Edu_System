module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  rootDir: '..',
  testMatch: ['<rootDir>/src/tests/**/*.test.ts', '<rootDir>/src/app/**/*.test.ts'],
};
