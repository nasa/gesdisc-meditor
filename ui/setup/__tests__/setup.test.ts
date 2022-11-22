import { getDocumentsForModel } from '../../documents/service'
import { getModels } from '../../models/service'
import { setUpNewInstallation } from '../service'

const mockUser = { name: 'Test User', uid: 'testuser' }
let lastModified: string

//* these tests carry state forward
describe('Setup', () => {
    test('DB is empty before setup', async () => {
        const [error, models] = await getModels()

        expect(models.length).toBe(0)
    })

    test('DB is populated after setup', async () => {
        await setUpNewInstallation([mockUser])

        const [modelsError, models] = await getModels()

        expect(models.length).toBe(4)

        //* store the modifiedOn information for later tests
        const [error, users] = await getDocumentsForModel('Users')
        const [user] = users

        lastModified = user['x-meditor'].modifiedOn
    })

    test('DB has user', async () => {
        const [modelsError, models] = await getModels()
        const [error, users] = await getDocumentsForModel('Users')
        const [user] = users

        expect(models.length).toBe(4)
        expect(user.name).toBe(mockUser.name)
    })

    test('DB does not double seed', async () => {
        const [error] = await setUpNewInstallation([mockUser])
        const [documentsError, users] = await getDocumentsForModel('Users')
        const [user] = users

        expect(error).toMatchInlineSnapshot(
            `[Error: mEditor's DB has already been seeded.]`
        )

        //* verify that the user was only modified in the initial DB seed
        expect(user['x-meditor'].modifiedOn).toBe(lastModified)
    })
})
