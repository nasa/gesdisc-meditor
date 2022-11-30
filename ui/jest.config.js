/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const tsPreset = require('ts-jest/jest-preset')
const mongoPreset = require('@shelf/jest-mongodb/jest-preset')

const jestOverwrites = {
    testEnvironment: 'node',
    watchPathIgnorePatterns: [
        '<rootDir>/cypress/',
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/globalConfig.json',
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setupAfter.ts'],
}

module.exports = { ...tsPreset, ...mongoPreset, ...jestOverwrites }
