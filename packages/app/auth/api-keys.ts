import assert from 'assert'
import createError from 'http-errors'
import { getDb } from '../lib/connections'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import type { NextApiRequest } from 'next'

const scrypt = promisify(scryptCallback)

export const API_KEY_PREFIX = 'med_sk'
export const MAX_ACTIVE_API_KEYS = 5
const API_KEYS_COLLECTION_NAME = 'api_keys'

type ApiKeyDocument = {
    uid: string
    keyId: string
    name: string
    tokenHash: string
    createdAt: Date
    expiresAt?: Date | null
    revokedAt?: Date
    lastUsedAt?: Date
}

type ApiKeyMetadata = Omit<ApiKeyDocument, 'tokenHash' | 'uid'> & {
    isExpired: boolean
}

type CreateApiKeyInput = {
    uid: string
    name: string
    expiresAt?: Date | null
}

type ApiKeyPrincipal = {
    uid: string
    keyId: string
    expiresAt?: Date | null
}

let indexesPromise: Promise<void>

function getPepper() {
    const pepper = process.env.API_KEYS_PEPPER || process.env.APP_SECRET

    assert(
        pepper,
        new createError.InternalServerError(
            'Missing APP_SECRET or API_KEYS_PEPPER for API key hashing'
        )
    )

    return pepper
}

function getApiKeysCollection() {
    return getDb().then(db => db.collection<ApiKeyDocument>(API_KEYS_COLLECTION_NAME))
}

async function ensureApiKeyIndexes() {
    if (!indexesPromise) {
        indexesPromise = (async () => {
            const collection = await getApiKeysCollection()

            await Promise.all([
                collection.createIndex({ keyId: 1 }, { unique: true }),
                collection.createIndex({ uid: 1, createdAt: -1 }),
                collection.createIndex({ expiresAt: 1 }),
            ])
        })().catch(err => {
            indexesPromise = null
            throw err
        })
    }

    await indexesPromise
}

function makeToken() {
    const keyId = randomBytes(6).toString('hex')
    const secret = randomBytes(24).toString('base64url')
    const token = `${API_KEY_PREFIX}_${keyId}_${secret}`

    return {
        keyId,
        token,
    }
}

async function hashApiKeyToken(token: string) {
    const salt = randomBytes(16).toString('hex')
    const derivedKey = (await scrypt(`${token}:${getPepper()}`, salt, 64)) as Buffer

    return `v1$${salt}$${derivedKey.toString('hex')}`
}

async function verifyApiKeyToken(token: string, hash: string) {
    const [version, salt, digest] = hash.split('$')

    if (version !== 'v1' || !salt || !digest) {
        return false
    }

    const expectedHashBuffer = Buffer.from(digest, 'hex')
    const actualHashBuffer = (await scrypt(
        `${token}:${getPepper()}`,
        salt,
        64
    )) as Buffer

    if (actualHashBuffer.length !== expectedHashBuffer.length) {
        return false
    }

    return timingSafeEqual(actualHashBuffer, expectedHashBuffer)
}

function parseToken(token: string) {
    const tokenRegex = new RegExp(
        `^${API_KEY_PREFIX}_([a-f0-9]{12})_([A-Za-z0-9_-]+)$`
    )
    const match = token.match(tokenRegex)

    if (!match) {
        return null
    }

    return {
        keyId: match[1],
    }
}

function normalizeAuthorizationHeaderValue(
    authorizationHeader: string | string[] | undefined
) {
    if (!authorizationHeader) {
        return null
    }

    const value = Array.isArray(authorizationHeader)
        ? authorizationHeader[0]
        : authorizationHeader

    if (!value?.toLowerCase().startsWith('bearer ')) {
        return null
    }

    return value.slice('Bearer '.length).trim()
}

function activeApiKeysForUserFilter(uid: string) {
    const now = new Date()

    return {
        uid,
        revokedAt: { $exists: false },
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: now } },
        ],
    }
}

function mapApiKeyMetadata(apiKey: ApiKeyDocument): ApiKeyMetadata {
    return {
        keyId: apiKey.keyId,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt ?? null,
        revokedAt: apiKey.revokedAt,
        lastUsedAt: apiKey.lastUsedAt,
        isExpired: !!apiKey.expiresAt && apiKey.expiresAt.getTime() <= Date.now(),
    }
}

export async function listApiKeysForUser(uid: string): Promise<ApiKeyMetadata[]> {
    await ensureApiKeyIndexes()

    const collection = await getApiKeysCollection()
    const apiKeys = await collection.find({ uid }).sort({ createdAt: -1 }).toArray()

    return apiKeys.map(mapApiKeyMetadata)
}

export async function createApiKeyForUser({
    uid,
    name,
    expiresAt,
}: CreateApiKeyInput): Promise<{ token: string; apiKey: ApiKeyMetadata }> {
    await ensureApiKeyIndexes()

    const collection = await getApiKeysCollection()
    const activeKeyCount = await collection.countDocuments(
        activeApiKeysForUserFilter(uid)
    )

    assert(
        activeKeyCount < MAX_ACTIVE_API_KEYS,
        new createError.BadRequest(
            `You can only have up to ${MAX_ACTIVE_API_KEYS} active API keys.`
        )
    )

    if (expiresAt) {
        assert(
            expiresAt.getTime() > Date.now(),
            new createError.BadRequest('`expiresAt` must be a future datetime')
        )
    }

    const tokenParts = makeToken()
    const tokenHash = await hashApiKeyToken(tokenParts.token)

    const apiKeyDocument: ApiKeyDocument = {
        uid,
        keyId: tokenParts.keyId,
        name,
        tokenHash,
        createdAt: new Date(),
        expiresAt: expiresAt ?? null,
    }

    await collection.insertOne(apiKeyDocument)

    return {
        token: tokenParts.token,
        apiKey: mapApiKeyMetadata(apiKeyDocument),
    }
}

export async function revokeApiKeyForUser(uid: string, keyId: string) {
    await ensureApiKeyIndexes()

    const collection = await getApiKeysCollection()
    const { modifiedCount } = await collection.updateOne(
        {
            uid,
            keyId,
            revokedAt: { $exists: false },
        },
        {
            $set: {
                revokedAt: new Date(),
            },
        }
    )

    assert(modifiedCount, new createError.NotFound('API key not found'))
}

export async function resolveApiKeyPrincipal(
    authorizationHeader: string | string[] | undefined
): Promise<ApiKeyPrincipal | null> {
    await ensureApiKeyIndexes()

    const token = normalizeAuthorizationHeaderValue(authorizationHeader)

    if (!token) {
        return null
    }

    const parsedToken = parseToken(token)

    if (!parsedToken) {
        return null
    }

    const collection = await getApiKeysCollection()
    const apiKey = await collection.findOne({
        keyId: parsedToken.keyId,
        revokedAt: { $exists: false },
    })

    if (!apiKey) {
        return null
    }

    if (apiKey.expiresAt && apiKey.expiresAt.getTime() <= Date.now()) {
        return null
    }

    const isValid = await verifyApiKeyToken(token, apiKey.tokenHash)

    if (!isValid) {
        return null
    }

    await collection.updateOne(
        { keyId: apiKey.keyId },
        {
            $set: {
                lastUsedAt: new Date(),
            },
        }
    )

    return {
        uid: apiKey.uid,
        keyId: apiKey.keyId,
        expiresAt: apiKey.expiresAt ?? null,
    }
}

export async function resolveApiKeyPrincipalFromRequest(
    req: NextApiRequest
): Promise<ApiKeyPrincipal | null> {
    return resolveApiKeyPrincipal(req.headers.authorization)
}
