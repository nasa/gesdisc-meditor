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

    await seedUsers(db)
    await seedModels(db)
    await seedWorkflows(db)

    console.log('Finished seeding!')

    await mongoClient.close(true)

    process.stdin.end()
    process.exit(0)
}

async function seedUsers(db) {
    const fullDirPath = `${__dirname}/users/`

    console.log(`Seeding users, from directory, ${fullDirPath}`)

    const users = await seedDocsFromDirectory(db, fullDirPath, 'Users', 'id')

    console.log('Seeded ', users)
}

async function seedModels(db) {
    const fullDirPath = `${__dirname}/models/`

    console.log(`Seeding models, from directory, ${fullDirPath}`)

    const models = await seedDocsFromDirectory(db, fullDirPath, 'Models')

    console.log('Seeded ', models)

    // also drop any existing documents for each of these seeded models
    return Promise.all(
        models.map(async model => {
            console.log('Dropping collection: ', model)

            try {
                await db.collection(model).drop()
            } catch (err) {
                // swallow any errors when dropping the collection
            }
        })
    )
}

async function seedWorkflows(db) {
    const fullDirPath = `${__dirname}/workflows/`

    console.log(`Seeding workflows, from directory, ${fullDirPath}`)

    const workflows = await seedDocsFromDirectory(db, fullDirPath, 'Workflows')

    console.log('Seeded ', workflows)
}

async function seedDocsFromDirectory(db, dir, collectionName, idProperty = 'name') {
    const seedFiles = fs.readdirSync(dir)

    return Promise.all(
        seedFiles.map(async seedFile => {
            const seedDoc = JSON.parse(fs.readFileSync(dir + seedFile))

            console.log(`Seeding doc: ${seedDoc[idProperty]}`)

            await db
                .collection(collectionName)
                .deleteMany({ [idProperty]: seedDoc[idProperty] }) // delete any existing seedDocs with this id
            await db.collection(collectionName).insertOne(seedDoc)

            return seedDoc[idProperty]
        })
    )
}

main()
