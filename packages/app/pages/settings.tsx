import Button from 'react-bootstrap/Button'
import PageTitle from 'components/page-title'
import styles from './settings.module.css'
import { getServerSession } from 'auth/user'
import { parseResponse } from 'utils/api'
import { useEffect, useMemo, useState } from 'react'
import type { GetServerSidePropsContext } from 'next'
import type { FormEvent } from 'react'

type ApiKey = {
    keyId: string
    name: string
    createdAt: string
    expiresAt?: string | null
    revokedAt?: string
    lastUsedAt?: string
    isExpired: boolean
}

type ApiKeysApiResponse = {
    apiKeys: ApiKey[]
    maxActiveKeys: number
}

function formatDate(value?: string | null) {
    if (!value) {
        return 'Never'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return 'Invalid date'
    }

    return date.toLocaleString()
}

export default function SettingsPage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [maxActiveKeys, setMaxActiveKeys] = useState(5)
    const [name, setName] = useState('')
    const [expiresAt, setExpiresAt] = useState('')
    const [lastCreatedToken, setLastCreatedToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const activeKeyCount = useMemo(
        () =>
            apiKeys.filter(apiKey => {
                return !apiKey.revokedAt && !apiKey.isExpired
            }).length,
        [apiKeys]
    )

    async function loadApiKeys() {
        setIsLoading(true)

        try {
            const response = await fetch('/meditor/api/user/api-keys')
            const body = (await parseResponse(response)) as ApiKeysApiResponse

            if (!response.ok) {
                throw new Error((body as any)?.error || 'Failed to load API keys')
            }

            setApiKeys(body.apiKeys || [])
            setMaxActiveKeys(body.maxActiveKeys || 5)
            setError(null)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadApiKeys()
    }, [])

    async function handleCreateApiKey(event: FormEvent) {
        event.preventDefault()

        setIsSaving(true)

        try {
            const response = await fetch('/meditor/api/user/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
                }),
            })

            const body = (await parseResponse(response)) as {
                token?: string
                error?: string
            }

            if (!response.ok) {
                throw new Error(body?.error || 'Failed to create API key')
            }

            setLastCreatedToken(body.token || null)
            setName('')
            setExpiresAt('')
            setError(null)
            await loadApiKeys()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleRevoke(keyId: string) {
        const shouldRevoke = window.confirm(
            'Revoke this API key? Existing clients using it will stop working immediately.'
        )

        if (!shouldRevoke) {
            return
        }

        try {
            const response = await fetch(`/meditor/api/user/api-keys/${keyId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const body = await parseResponse(response)
                throw new Error((body as any)?.error || 'Failed to revoke API key')
            }

            setError(null)
            await loadApiKeys()
        } catch (err) {
            setError((err as Error).message)
        }
    }

    async function copyToken(token: string) {
        await navigator.clipboard.writeText(token)
    }

    return (
        <div className={styles.page}>
            <PageTitle title="Settings" />

            <h2 className={styles.sectionTitle}>Settings</h2>
            <p className={styles.sectionSubtitle}>
                Manage your user-level API access.
            </p>

            <section className={styles.card}>
                <h4>API Keys</h4>

                <p className={styles.helpText}>
                    Create up to {maxActiveKeys} active keys. Store new keys securely;
                    the full token is shown only once.
                </p>

                <form onSubmit={handleCreateApiKey}>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="api-key-name">
                                Key name
                            </label>
                            <input
                                id="api-key-name"
                                className={styles.input}
                                value={name}
                                maxLength={80}
                                placeholder="Automation key"
                                onChange={event => setName(event.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="api-key-expiry">
                                Expiration
                            </label>
                            <input
                                id="api-key-expiry"
                                className={styles.input}
                                type="datetime-local"
                                value={expiresAt}
                                onChange={event => setExpiresAt(event.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={
                                isSaving ||
                                !name.trim() ||
                                activeKeyCount >= maxActiveKeys
                            }
                        >
                            {isSaving ? 'Creating...' : 'Create API key'}
                        </Button>
                    </div>
                </form>

                {lastCreatedToken && (
                    <div className={styles.tokenDisplay}>
                        <strong>New API key</strong>
                        <p className={styles.helpText}>
                            Copy this now. You will not be able to view it again.
                        </p>
                        <div className={styles.tokenCode}>{lastCreatedToken}</div>
                        <Button onClick={() => copyToken(lastCreatedToken)}>
                            Copy token
                        </Button>
                    </div>
                )}
            </section>

            <section className={styles.card}>
                <h5>Existing keys</h5>

                {isLoading ? (
                    <p>Loading API keys...</p>
                ) : (
                    <table className={styles.list}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Key</th>
                                <th>Status</th>
                                <th>Expires</th>
                                <th>Last Used</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {apiKeys.map(apiKey => {
                                const statusClassName = apiKey.revokedAt
                                    ? `${styles.status} ${styles.statusRevoked}`
                                    : apiKey.isExpired
                                    ? `${styles.status} ${styles.statusExpired}`
                                    : `${styles.status} ${styles.statusActive}`

                                const status = apiKey.revokedAt
                                    ? 'Revoked'
                                    : apiKey.isExpired
                                    ? 'Expired'
                                    : 'Active'

                                return (
                                    <tr key={apiKey.keyId}>
                                        <td>{apiKey.name}</td>
                                        <td>*****</td>
                                        <td>
                                            <span className={statusClassName}>
                                                {status}
                                            </span>
                                        </td>
                                        <td>{formatDate(apiKey.expiresAt)}</td>
                                        <td>{formatDate(apiKey.lastUsedAt)}</td>
                                        <td>
                                            {!apiKey.revokedAt && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRevoke(apiKey.keyId)
                                                    }
                                                >
                                                    Revoke
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}

                            {!apiKeys.length && (
                                <tr>
                                    <td colSpan={6}>No API keys created yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                <p className={styles.helpText}>
                    Active keys: {activeKeyCount}/{maxActiveKeys}
                </p>

                {error && (
                    <p className={`${styles.helpText} ${styles.error}`}>{error}</p>
                )}
            </section>
        </div>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const session = await getServerSession(ctx.req, ctx.res)

    if (!session?.user?.uid) {
        return {
            redirect: {
                destination: '/signin',
                permanent: false,
            },
        }
    }

    return {
        props: {},
    }
}
