import { MongoMemoryServer } from 'mongodb-memory-server'
import fs from 'node:fs'

const mongod = await MongoMemoryServer.create({ instance: { port: 27118 } })
fs.writeFileSync('.dev-mongo-uri', mongod.getUri('bd_admin_integration'))
console.log('URI', mongod.getUri('bd_admin_integration'))
console.log('READY')
await new Promise(() => {})
