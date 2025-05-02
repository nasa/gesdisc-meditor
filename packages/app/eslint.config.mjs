import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
    // import.meta.dirname is available after Node.js v20.11.0
    baseDirectory: import.meta.dirname,
})

const eslintConfig = [
    ...compat.config({
        extends: ['next'],
    }),
    {
        rules: {
            'react-hooks/exhaustive-deps': 'off',
            '@next/next/no-html-link-for-pages': 1,
        },
    },
]

export default eslintConfig
