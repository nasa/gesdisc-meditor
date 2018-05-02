module.exports = {
  preset: 'jest-preset-angular',
  roots: ['src'],
  setupTestFrameworkScriptFile: './setup-jest.ts',
  transformIgnorePatterns: ['node_modules/(?!@ngrx|@ionic-native|@ionic)'],
  moduleNameMapper: {
    '^@reducers/(.*)$': '<rootDir>/src/app/reducers/$1',
    '^@models/(.*)$': '<rootDir>/src/app/models/$1'
  }
}
