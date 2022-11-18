const { MongoClient } = require('mongodb')
const fs = require('fs')

const mongoClient = new MongoClient('mongodb://localhost:27018/', {
    useUnifiedTopology: true,
})

async function main() {
    console.log('Seeding database for Cypress tests...')

    await mongoClient.connect()

    const db = mongoClient.db('meditor')

    console.log('Successfully connected to Mongo')

    await seedFromDirectory(db, 'users', 'Users', 'id')
    await seedFromDirectory(db, 'models', 'Models')
    await seedFromDirectory(db, 'workflows', 'Workflows')

    console.log('Finished seeding! Disconnecting')

    await mongoClient.close(true)

    process.exit()
}

async function seedFromDirectory(db, seedDir, collectionName, idProperty = 'name') {
    const fullDirPath = `${__dirname}/${seedDir}/`

    console.log(`Seeding ${collectionName}, from directory, ${fullDirPath}`)

    const seedFiles = fs.readdirSync(fullDirPath)

    return Promise.all(
        seedFiles.map(async seedFile => {
            const seedDoc = JSON.parse(fs.readFileSync(fullDirPath + seedFile))

            console.log(`Seeding doc: ${seedDoc[idProperty]}`)

            await db
                .collection(collectionName)
                .deleteMany({ [idProperty]: seedDoc[idProperty] }) // delete any existing seedDocs with this id
            await db.collection(collectionName).insertOne(seedDoc)
        })
    )
}

main()
