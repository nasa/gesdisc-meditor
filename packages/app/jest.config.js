/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const tsPreset = require('ts-jest/jest-preset')
const mongoPreset = require('@shelf/jest-mongodb/jest-preset')

process.env.TZ = 'GMT' // ensure all tests use GMT time, both locally and on CI servers

const jestOverwrites = {
    testEnvironment: 'node',
    watchPathIgnorePatterns: [
        '<rootDir>/cypress/',
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/globalConfig.json',
    ],
    setupFiles: ['<rootDir>/jest.setup.ts'],
    setupFilesAfterEnv: ['<rootDir>/jest.setupAfter.ts'],
}

module.exports = { ...tsPreset, ...mongoPreset, ...jestOverwrites }
