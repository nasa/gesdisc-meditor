import { decryptData, encryptData } from '../encrypt'

test('can decrypt data that was previously encrypted', () => {
    const data = {
        bacon: 'eggs',
    }

    const encryptedString = encryptData(data) // we can't really test encryptData on it's own, since the result is always different

    expect(decryptData(encryptedString)).toEqual(data)
})
