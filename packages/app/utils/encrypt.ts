import crypto from 'crypto'

const APP_SECRET = crypto.scryptSync(process.env.APP_SECRET!, 'salt', 32)
const ALGORITHM = 'aes-256-cbc' // Encryption algorithm
const IV_LENGTH = 16 // Length of the initialization vector

export function encryptData<T>(data: T): string {
    const serializedData = JSON.stringify(data) // Convert data to JSON string
    const iv = crypto.randomBytes(IV_LENGTH) // Initialization vector
    const cipher = crypto.createCipheriv(ALGORITHM, APP_SECRET, iv)

    let encrypted = cipher.update(serializedData, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Return the IV and encrypted data as a single string
    //? It is standard practice to transmit the IV alongside the ciphertext. Without the IV, the decryption process cannot reconstruct the original data.
    return `${iv.toString('hex')}:${encrypted}`
}

export function decryptData<T>(encryptedToken: string): T {
    const [ivHex, encrypted] = encryptedToken.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, APP_SECRET, iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    // Parse the decrypted JSON string back into its original type
    return JSON.parse(decrypted) as T
}
