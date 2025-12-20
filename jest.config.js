module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/helpers/'],
  moduleNameMapper: {
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@commands/(.*)$': '<rootDir>/src/commands/$1',
    '^@engines/(.*)$': '<rootDir>/src/engines/$1',
    '^@assets/(.*)$': '<rootDir>/src/components/Assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
