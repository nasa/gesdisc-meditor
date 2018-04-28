module.exports = {
  preset: 'jest-preset-angular',
  roots: [''],
  setupTestFrameworkScriptFile: './setup-jest.ts',
  transformIgnorePatterns: ['node_modules/(?!@ngrx|@ionic-native|@ionic)']
}
