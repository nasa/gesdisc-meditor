import { getDb } from '../../lib/connections'
import {
    API_KEY_PREFIX,
    MAX_ACTIVE_API_KEYS,
    createApiKeyForUser,
    listApiKeysForUser,
    resolveApiKeyPrincipal,
    revokeApiKeyForUser,
} from '../api-keys'
import type { Db } from 'mongodb'

describe('API keys', () => {
    let db: Db

    beforeEach(async () => {
        db = await getDb()
        await db.collection('api_keys').deleteMany({})
    })

    test('creates and lists API keys for a user', async () => {
        const { token, apiKey } = await createApiKeyForUser({
            uid: 'test-user',
            name: 'Test key',
        })

        expect(token.startsWith(`${API_KEY_PREFIX}_`)).toBeTruthy()
        expect(apiKey.name).toEqual('Test key')

        const keys = await listApiKeysForUser('test-user')

        expect(keys).toHaveLength(1)
        expect(keys[0].name).toEqual('Test key')
        expect((keys[0] as any).tokenPreview).toBeUndefined()
    })

    test(`allows only ${MAX_ACTIVE_API_KEYS} active API keys`, async () => {
        for (let index = 0; index < MAX_ACTIVE_API_KEYS; index++) {
            await createApiKeyForUser({
                uid: 'test-user',
                name: `key-${index}`,
            })
        }

        await expect(
            createApiKeyForUser({
                uid: 'test-user',
                name: 'one-too-many',
            })
        ).rejects.toThrow(`up to ${MAX_ACTIVE_API_KEYS} active API keys`)
    })

    test('resolves bearer token principal and updates last used timestamp', async () => {
        const { token, apiKey } = await createApiKeyForUser({
            uid: 'test-user',
            name: 'for-automation',
        })

        const principal = await resolveApiKeyPrincipal(`Bearer ${token}`)

        expect(principal?.uid).toEqual('test-user')
        expect(principal?.keyId).toEqual(apiKey.keyId)

        const keyInDb = await db
            .collection('api_keys')
            .findOne({ keyId: apiKey.keyId })
        expect(keyInDb?.lastUsedAt).toBeDefined()
    })

    test('revoked key can no longer be resolved', async () => {
        const { token, apiKey } = await createApiKeyForUser({
            uid: 'test-user',
            name: 'to-revoke',
        })

        await revokeApiKeyForUser('test-user', apiKey.keyId)

        const principal = await resolveApiKeyPrincipal(`Bearer ${token}`)

        expect(principal).toBeNull()
    })

    test('expired key cannot be resolved', async () => {
        const { token, apiKey } = await createApiKeyForUser({
            uid: 'test-user',
            name: 'to-expire',
            expiresAt: new Date(Date.now() + 1000 * 60),
        })

        await db.collection('api_keys').updateOne(
            { keyId: apiKey.keyId },
            {
                $set: {
                    expiresAt: new Date(Date.now() - 1000),
                },
            }
        )

        const principal = await resolveApiKeyPrincipal(`Bearer ${token}`)

        expect(principal).toBeNull()
    })
})
