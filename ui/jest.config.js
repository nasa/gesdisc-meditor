/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const tsPreset = require('ts-jest/jest-preset')
const mongoPreset = require('@shelf/jest-mongodb/jest-preset')

const jestOverwrites = {
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/cypress/'],
    setupFilesAfterEnv: ['<rootDir>/jest.setupAfter.ts'],
}

module.exports = { ...tsPreset, ...mongoPreset, ...jestOverwrites }
